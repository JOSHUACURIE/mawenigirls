import React, { useEffect, useState } from "react";
import axios from "axios";

const AnalyzedResults = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const res = await axios.get("/api/results/analyzed");
        setResults(res.data);
      } catch (err) {
        console.error("Failed to load analyzed results", err);
      }
    };
    loadResults();
  }, []);

  const handleDownload = async () => {
    try {
      const response = await axios.post("/api/results/export", {}, { responseType: "blob" });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "analyzed-results.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Failed to download file:", error);
    }
  };

  return (
    <div>
      <h3>Analyzed Results</h3>
      {results.length > 0 ? (
        <>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Student</th>
                <th>Total</th>
                <th>Grade</th>
                <th>Stream Rank</th>
                <th>Overall Rank</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res) => (
                <tr key={res.student._id}>
                  <td>{res.student.name}</td>
                  <td>{res.totalMarks}</td>
                  <td>{res.grade}</td>
                  <td>{res.streamRanking}</td>
                  <td>{res.overallRanking}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button style={{ marginTop: "15px" }} onClick={handleDownload}>
            📥 Download Excel
          </button>
        </>
      ) : (
        <p>No analyzed results available.</p>
      )}
    </div>
  );
};

export default AnalyzedResults;
