import React, { useState } from "react";
import api from "../services/api";

const DOSResultsAnalysis = () => {
  const [selectedForm, setSelectedForm] = useState("");
  const [availableForms] = useState(["Form 1", "Form 2", "Form 3", "Form 4"]);
  const [analyzedResults, setAnalyzedResults] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch results already analyzed from backend
  const fetchResultsByForm = async () => {
    if (!selectedForm) return setMessage("⚠️ Select a class");

    try {
      setLoading(true);
      setMessage("Loading results...");
      const res = await api.get(`/results?form=${encodeURIComponent(selectedForm)}`);
      const results = res.data || [];

      if (!results.length) {
        setMessage("⚠️ No results found for this class");
      } else {
        setAnalyzedResults(results);
        setMessage(`✅ ${results.length} student records loaded`);
      }
    } catch (err) {
      console.error("❌ Failed to fetch results:", err);
      setMessage("❌ Error fetching results");
    } finally {
      setLoading(false);
    }
  };

  // Export all results to Excel
  const handleExportToExcel = async () => {
    if (analyzedResults.length === 0) return;

    try {
      const res = await api.post(
        "/results/export",
        { results: analyzedResults, form: selectedForm },
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedForm}_Results.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setMessage(`✅ Excel exported successfully`);
    } catch (err) {
      console.error("❌ Excel export error:", err);
      setMessage("❌ Failed to export Excel");
    }
  };

  // Generate Word document for one student
  const handleDownloadIndividual = async (student) => {
    try {
      // Dynamic import of docx only in browser
      const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } = await import("docx");

      const subjectRows = student.scores.map(({ subject, marks, grade }) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(subject)] }),
            new TableCell({ children: [new Paragraph(String(marks ?? "-"))] }),
            new TableCell({ children: [new Paragraph(grade ?? "-")] }),
          ],
        })
      );

      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({ children: [new TextRun({ text: "ST. PETERS MAWENI GIRLS SECONDARY SCHOOL", bold: true })] }),
              new Paragraph({ children: [new TextRun("Terminal Examination Results")] }),
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

      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${student.admissionNumber}_Result.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setMessage(`✅ Word exported for ${student.name}`);
    } catch (err) {
      console.error("❌ Word export error:", err);
      setMessage(`❌ Failed to export result for ${student.name}`);
    }
  };

  // Download all students individually in a zip
  const handleDownloadAllIndividual = async () => {
    if (analyzedResults.length === 0) return;

    try {
      const JSZip = (await import("jszip")).default;
      const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } = await import("docx");

      const zip = new JSZip();

      for (const student of analyzedResults) {
        const subjectRows = student.scores.map(({ subject, marks, grade }) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(subject)] }),
              new TableCell({ children: [new Paragraph(String(marks ?? "-"))] }),
              new TableCell({ children: [new Paragraph(grade ?? "-")] }),
            ],
          })
        );

        const doc = new Document({
          sections: [
            {
              children: [
                new Paragraph({ children: [new TextRun({ text: "ST. PETERS MAWENI GIRLS SECONDARY SCHOOL", bold: true })] }),
                new Paragraph({ children: [new TextRun("Terminal Examination Results")] }),
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

        const buffer = await Packer.toBuffer(doc);
        zip.file(`${student.admissionNumber}_Result.docx`, buffer);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedForm}_Individual_Results.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setMessage(`✅ ${analyzedResults.length} individual reports downloaded`);
    } catch (err) {
      console.error("❌ ZIP export error:", err);
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

        <button onClick={fetchResultsByForm} disabled={loading}>
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

      <div className="score-table">
        <h4>Results ({analyzedResults.length} students)</h4>
        {analyzedResults.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Adm No</th>
                <th>Name</th>
                {analyzedResults[0].scores.map(s => <th key={s.subject}>{s.subject}</th>)}
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
                  {student.scores.map(s => (
                    <td key={s.subject}>
                      {s.marks ?? "-"} {s.grade ?? ""}
                    </td>
                  ))}
                  <td>{student.totalMarks ?? "-"}</td>
                  <td>{student.overallGrade ?? "-"}</td>
                  <td>
                    <button onClick={() => handleDownloadIndividual(student)}>
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DOSResultsAnalysis;
