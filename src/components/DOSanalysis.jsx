import React, { useState } from "react";
import api from "../services/api";

const DOSResultsAnalysis = () => {
  const [selectedForm, setSelectedForm] = useState("");
  const [availableForms] = useState(["Form 1", "Form 2", "Form 3", "Form 4"]);
  const [analyzedResults, setAnalyzedResults] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch analyzed results from backend
  const fetchResults = async () => {
    if (!selectedForm) return setMessage("⚠️ Select a class");

    try {
      setLoading(true);
      setMessage("Loading results...");
      const res = await api.get("/results", { params: { form: selectedForm } });

      if (!res.data || res.data.length === 0) {
        setMessage("⚠️ No results found for this class");
        setAnalyzedResults([]);
        return;
      }

      const subjectList = res.data[0].scores.map((s) => s.subjectName);
      setSubjects(subjectList);
      setAnalyzedResults(res.data);
      setMessage(`✅ ${res.data.length} student records loaded`);
    } catch (err) {
      console.error("❌ Failed to fetch results:", err);
      setMessage("❌ Error fetching results");
    } finally {
      setLoading(false);
    }
  };

  // Download all results as Excel from backend
  const handleExportToExcel = async () => {
    if (!selectedForm) return;

    try {
      const res = await api.post(
        "/results/export",
        { form: selectedForm },
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
    } catch (err) {
      console.error("❌ Failed to export Excel:", err);
      setMessage("❌ Failed to export Excel");
    }
  };

  return (
    <div className="dos-results-analysis">
      <h3>Results Analysis</h3>

      <div className="input-group">
        <select
          value={selectedForm}
          onChange={(e) => setSelectedForm(e.target.value)}
        >
          <option value="">-- Select Form --</option>
          {availableForms.map((form) => (
            <option key={form} value={form}>
              {form}
            </option>
          ))}
        </select>

        <button onClick={fetchResults} disabled={loading}>
          {loading ? "Loading..." : "Load Results"}
        </button>

        <button
          onClick={handleExportToExcel}
          disabled={analyzedResults.length === 0}
        >
          Export All to Excel
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes("❌") ? "error" : ""}`}>
          {message}
        </div>
      )}

      {analyzedResults.length > 0 && (
        <div className="score-table">
          <h4>Results ({analyzedResults.length} students)</h4>
          <table>
            <thead>
              <tr>
                <th>Adm No</th>
                <th>Name</th>
                {subjects.map((subj) => (
                  <th key={subj}>{subj}</th>
                ))}
                <th>Total</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {analyzedResults.map((student, idx) => (
                <tr key={idx}>
                  <td>{student.admissionNumber}</td>
                  <td>{student.name}</td>
                  {student.scores.map((s, i) => (
                    <td key={i}>
                      {s.score ?? "-"} {s.grade ?? ""}
                    </td>
                  ))}
                  <td>{student.totalMarks ?? "-"}</td>
                  <td>{student.overallGrade ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DOSResultsAnalysis;
