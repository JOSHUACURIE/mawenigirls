import React, { useEffect, useState } from "react";
import axios from "axios";

const ResultAnalysisTable = () => {
  const [analysis, setAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.post("https://mawen.onrender.com", {
          studentsHaveChosenSubjects: false,
          schoolId: "1", // Use actual schoolId if available
        });
        setAnalysis(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load analysis");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) return <p>⏳ Loading result analysis...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

 
  const allGrades = Array.from(
    new Set(analysis.flatMap(r => r.scores.map(s => s.grade)))
  ).sort();

  const computeGradeDistribution = (subject) => {
    const gradeCounts = {};
    for (const grade of allGrades) {
      gradeCounts[grade] = 0;
    }

    analysis.forEach(result => {
      result.scores.forEach(score => {
        if (score.subject === subject) {
          gradeCounts[score.grade] = (gradeCounts[score.grade] || 0) + 1;
        }
      });
    });

    return gradeCounts;
  };

  const computeAverage = (subject) => {
    let total = 0;
    let count = 0;
    analysis.forEach(result => {
      result.scores.forEach(score => {
        if (score.subject === subject) {
          total += score.marks;
          count++;
        }
      });
    });
    return count > 0 ? (total / count).toFixed(2) : "N/A";
  };

  const subjects = Array.from(
    new Set(analysis.flatMap(r => r.scores.map(s => s.subject)))
  );

  return (
    <div style={{ marginTop: "40px" }}>
      <h3>📋 Subject-Wise Performance Summary</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th>Subject</th>
            <th>Average Marks</th>
            {allGrades.map(grade => (
              <th key={grade}>{grade}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subjects.map(subject => {
            const gradeDist = computeGradeDistribution(subject);
            return (
              <tr key={subject}>
                <td>{subject}</td>
                <td>{computeAverage(subject)}</td>
                {allGrades.map(grade => (
                  <td key={grade}>{gradeDist[grade] || 0}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ResultAnalysisTable;
