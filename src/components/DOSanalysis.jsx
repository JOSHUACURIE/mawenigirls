import React, { useState, useEffect } from "react";
import api from "../services/api";
import { generateExcel } from "../api/utils/generateExcel";
import { analyzeStudentResults } from "../api/utils/analyzeStudentResult";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } from "docx";

const DOSResultsAnalysis = ({ gradingMethod = "points", className, stream }) => {
  const [selectedForm, setSelectedForm] = useState(className || "");
  const [selectedStream, setSelectedStream] = useState(stream || "");
  const [availableForms] = useState(["Form 1", "Form 2", "Form 3", "Form 4"]);
  const [subjects, setSubjects] = useState([]);
  const [analyzedResults, setAnalyzedResults] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch scores for selected form and stream
  const fetchScores = async () => {
    if (!selectedForm || !selectedStream) {
      setMessage("⚠️ Select class and stream");
      return;
    }

    try {
      setLoading(true);
      setMessage("Loading scores...");
      const res = await api.get("/scores", {
        params: { form: selectedForm, stream: selectedStream },
      });

      const rawScores = res.data || [];
      const subjectSet = new Set();
      const studentMap = new Map();

      rawScores.forEach(({ student, subject, score }) => {
        if (!student || !subject) return;
        subjectSet.add(subject.name);

        const key = student._id;
        if (!studentMap.has(key)) {
          studentMap.set(key, {
            name: student.name,
            admissionNumber: student.admissionNumber,
            stream: student.stream,
            scores: {},
            subjectGrades: {},
          });
        }

        studentMap.get(key).scores[subject.name] = score;
      });

      const subjectList = [...subjectSet].sort();
      const studentList = [...studentMap.values()];

      const analyzed = analyzeStudentResults(studentList, subjectList, gradingMethod);

      setSubjects(subjectList);
      setAnalyzedResults(analyzed);
      setMessage(`✅ ${analyzed.length} student records loaded`);
    } catch (err) {
      console.error("❌ Failed to fetch scores:", err);
      setMessage("❌ Error fetching scores");
    } finally {
      setLoading(false);
    }
  };

  // ===================== EXPORT =====================
  const handleExportToExcel = async () => {
    if (analyzedResults.length === 0) return;

    try {
      const formattedResults = analyzedResults.map((student) => ({
        student: {
          admissionNumber: student.admissionNumber,
          name: student.name,
          stream: student.stream || "-",
        },
        scores: subjects.map((subj) => ({
          subject: subj,
          marks: student.scores[subj] ?? 0,
          grade: student.subjectGrades[subj] ?? "N/A",
        })),
        totalMarks: student.totalMarks,
        grade: student.overallGrade,
      }));

      const buffer = await generateExcel(formattedResults);
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedForm}_${selectedStream}_Results.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("❌ Excel Export Error:", err);
      setMessage("❌ Failed to export Excel");
    }
  };

  // ===================== WORD DOCUMENT =====================
  const generateWordDocument = (student) => {
    const subjectRows = subjects.map((subj) =>
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(subj)] }),
          new TableCell({ children: [new Paragraph(String(student.scores[subj] ?? "-"))] }),
          new TableCell({ children: [new Paragraph(student.subjectGrades[subj] ?? "-")] }),
        ],
      })
    );

    return new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "ST. PETERS MAWENI GIRLS SECONDARY SCHOOL",
                  bold: true,
                }),
              ],
            }),
            new Paragraph("Terminal Examination Results"),
            new Paragraph(""),
            new Paragraph(`Name: ${student.name}`),
            new Paragraph(`Admission No: ${student.admissionNumber}`),
            new Paragraph(`Class: ${selectedForm} ${student.stream || ""}`),
            new Paragraph(""),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Subject")] }),
                    new TableCell({ children: [new Paragraph("Marks")] }),
                    new TableCell({ children: [new Paragraph("Grade")] }),
                  ],
                }),
                ...subjectRows,
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Total")] }),
                    new TableCell({ children: [new Paragraph(String(student.totalMarks ?? "-"))] }),
                    new TableCell({ children: [new Paragraph("")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Overall Grade")] }),
                    new TableCell({ children: [new Paragraph("")] }),
                    new TableCell({ children: [new Paragraph(student.overallGrade ?? "-")] }),
                  ],
                }),
              ],
            }),
            new Paragraph(""),
            new Paragraph("Principal's Signature: __________________________"),
            new Paragraph("Date: __________________________"),
          ],
        },
      ],
    });
  };

  const handleDownloadIndividual = async (student) => {
    try {
      const doc = generateWordDocument(student);
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${student.admissionNumber}_Result.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("❌ Word Export Error:", err);
      setMessage(`❌ Failed to export result for ${student.admissionNumber}`);
    }
  };

  const handleDownloadAllIndividual = async () => {
    if (analyzedResults.length === 0) return;

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      for (const student of analyzedResults) {
        const doc = generateWordDocument(student);
        const buffer = await Packer.toBuffer(doc);
        zip.file(`${student.admissionNumber}_Result.docx`, buffer);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedForm}_${selectedStream}_Individual_Results.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setMessage(`✅ ${analyzedResults.length} individual reports downloaded`);
    } catch (err) {
      console.error("❌ ZIP Export Error:", err);
      setMessage("❌ Failed to export individual reports");
    }
  };

  return (
    <div className="dos-results-analysis">
      <h3>Results Analysis</h3>

      <div className="input-group">
        <select value={selectedForm} onChange={(e) => setSelectedForm(e.target.value)}>
          <option value="">-- Select Form --</option>
          {availableForms.map((form) => (
            <option key={form} value={form}>{form}</option>
          ))}
        </select>

        <input
          type="text"
          value={selectedStream}
          placeholder="Enter Stream (e.g. A)"
          onChange={(e) => setSelectedStream(e.target.value)}
        />

        <button onClick={fetchScores} disabled={loading}>
          {loading ? "Loading..." : "Load Results"}
        </button>

        <button onClick={handleExportToExcel} disabled={analyzedResults.length === 0}>
          Export All to Excel
        </button>

        <button onClick={handleDownloadAllIndividual} disabled={analyzedResults.length === 0}>
          Download All Individual
        </button>
      </div>

      {message && <div className={`message ${message.includes("❌") ? "error" : ""}`}>{message}</div>}

      {analyzedResults.length > 0 && (
        <table className="score-table">
          <thead>
            <tr>
              <th>Adm No</th>
              <th>Name</th>
              {subjects.map((subj) => <th key={subj}>{subj}</th>)}
              <th>Total</th>
              <th>Grade</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {analyzedResults.map((student, idx) => (
              <tr key={idx}>
                <td>{student.admissionNumber}</td>
                <td>{student.name}</td>
                {subjects.map((subj) => (
                  <td key={subj}>
                    {student.scores[subj] ?? "-"} {student.subjectGrades[subj] ?? ""}
                  </td>
                ))}
                <td>{student.totalMarks ?? "-"}</td>
                <td>{student.overallGrade ?? "-"}</td>
                <td>
                  <button onClick={() => handleDownloadIndividual(student)}>Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DOSResultsAnalysis;
