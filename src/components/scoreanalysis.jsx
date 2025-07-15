import React, { useEffect, useState } from "react";
import api from "../services/api";
import './scorenalysis.css'
// Sample grading thresholds
const getGrade = (average) => {
  if (average >= 80) return "A";
  if (average >= 75) return "A-";
  if (average >= 70) return "B+";
  if (average >= 65) return "B";
  if (average >= 60) return "B-";
  if (average >= 55) return "C+";
  if (average >= 50) return "C";
  if (average >= 45) return "C-";
  if (average >= 40) return "D+";
  if (average >= 35) return "D";
  if (average >= 30) return "D-";
  return "E";
};

const ClassScoresAnalysis = () => {
  const [className, setClassName] = useState("");
  const [scoresData, setScoresData] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchScores = async () => {
    if (!className) {
      setMessage("Please select a class");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await api.get("/api/scores/class", {
        params: { className }
      });

      setScoresData(res.data);
      groupScoresByStudent(res.data);
    } catch (err) {
      console.error("Error fetching scores:", err);
      setMessage("❌ Failed to fetch scores");
    } finally {
      setLoading(false);
    }
  };

  const groupScoresByStudent = (scores) => {
    const groupedData = {};

    scores.forEach((score) => {
      const studentId = score.student._id;
      if (!groupedData[studentId]) {
        groupedData[studentId] = {
          student: score.student,
          subjects: [],
          total: 0,
          count: 0
        };
      }

      groupedData[studentId].subjects.push({
        subject: score.subject.name,
        marks: score.score,
        teacher: score.teacher?.name || "N/A"
      });

      groupedData[studentId].total += score.score;
      groupedData[studentId].count += 1;
    });

    setGrouped(groupedData);
  };

  const classOptions = [
    "Form 1",
    "Form 2",
    "Form 3",
    "Form 4"
  ];

  return (
    <div className="class-score-analysis">
      <h3>📘 Class Results Analysis</h3>

      <div className="input-group">
        <select
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="input-field"
        >
          <option value="">-- Select Class --</option>
          {classOptions.map((cls) => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
        <button onClick={fetchScores} className="action-btn">
          {loading ? "Loading..." : "Load Scores"}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes("❌") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {/* Render grouped student scores */}
      {Object.keys(grouped).length > 0 && (
        <div className="results-table">
          {Object.values(grouped).map(({ student, subjects, total, count }) => {
            const average = total / count;
            const grade = getGrade(average);

            return (
              <div key={student._id} className="student-card">
                <h4>{student.name} ({student.admissionNumber})</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Marks</th>
                      <th>Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((s, idx) => (
                      <tr key={idx}>
                        <td>{s.subject}</td>
                        <td>{s.marks}</td>
                        <td>{s.teacher}</td>
                      </tr>
                    ))}
                    <tr className="summary-row">
                      <td><strong>Total</strong></td>
                      <td><strong>{total}</strong></td>
                      <td></td>
                    </tr>
                    <tr className="summary-row">
                      <td><strong>Average</strong></td>
                      <td><strong>{average.toFixed(2)}</strong></td>
                      <td><strong>Grade: {grade}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClassScoresAnalysis;
