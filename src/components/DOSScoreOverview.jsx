import React, { useState, useEffect } from "react";
import api from "../services/api"; // your axios instance or fetch wrapper

const DosScoresView = ({ subjects }) => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null); // track which score is updating

  const forms = ["Form 1", "Form 2", "Form 3", "Form 4"];

  useEffect(() => {
    if (!selectedSubject && !selectedForm) {
      setScores([]);
      return;
    }

    const fetchScores = async () => {
      setLoading(true);
      setMessage("");
      try {
        const params = new URLSearchParams();
        if (selectedSubject) params.append("subjectId", selectedSubject);
        if (selectedForm) params.append("form", selectedForm);

        const res = await api.get(`/scores?${params.toString()}`);
        setScores(
          res.data.map((score) => ({
            ...score,
            editableScore: score.score.toString(),
            updateMessage: "",
          }))
        );
        if (res.data.length === 0) {
          setMessage("No scores found for selected filters.");
        }
      } catch (err) {
        console.error("❌ Error fetching scores:", err.message);
        setMessage("Failed to fetch scores.");
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [selectedSubject, selectedForm]);

  const handleScoreChange = (id, value) => {
    setScores((prevScores) =>
      prevScores.map((score) =>
        score._id === id ? { ...score, editableScore: value } : score
      )
    );
  };

  const handleUpdateScore = async (id) => {
    const scoreObj = scores.find((s) => s._id === id);
    if (!scoreObj) return;

    const newScore = Number(scoreObj.editableScore);
    if (isNaN(newScore) || newScore < 0 || newScore > 100) {
      setScores((prevScores) =>
        prevScores.map((score) =>
          score._id === id
            ? { ...score, updateMessage: "❌ Score must be between 0 and 100." }
            : score
        )
      );
      return;
    }

    setUpdatingId(id);
    setScores((prevScores) =>
      prevScores.map((score) =>
        score._id === id ? { ...score, updateMessage: "" } : score
      )
    );

    try {
      const res = await api.put(`/scores/${id}`, { score: newScore });
      setScores((prevScores) =>
        prevScores.map((score) =>
          score._id === id
            ? {
                ...score,
                score: res.data.score,
                editableScore: res.data.score.toString(),
                updateMessage: "✅ Updated successfully",
              }
            : score
        )
      );
    } catch (error) {
      console.error("❌ Error updating score:", error.message);
      setScores((prevScores) =>
        prevScores.map((score) =>
          score._id === id
            ? { ...score, updateMessage: "❌ Update failed" }
            : score
        )
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="dos-scores-view">
      <h3>Submitted Scores</h3>

      <div className="filters" style={{ marginBottom: "1rem" }}>
        <label>
          Subject:{" "}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">-- All Subjects --</option>
            {subjects.map((subj) => (
              <option key={subj._id} value={subj._id}>
                {subj.name} ({subj.form})
              </option>
            ))}
          </select>
        </label>

        <label style={{ marginLeft: "1rem" }}>
          Form:{" "}
          <select
            value={selectedForm}
            onChange={(e) => setSelectedForm(e.target.value)}
          >
            <option value="">-- All Forms --</option>
            {forms.map((form) => (
              <option key={form} value={form}>
                {form}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p>Loading scores...</p>
      ) : message ? (
        <p>{message}</p>
      ) : (
        <table
          className="scores-table"
          border={1}
          cellPadding={5}
          cellSpacing={0}
          style={{ width: "100%", maxWidth: "900px" }}
        >
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Admission Number</th>
              <th>Subject</th>
              <th>Form</th>
              <th>Score</th>
              <th>Teacher</th>
              <th>Submitted At</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score) => (
              <tr key={score._id}>
                <td>{score.student?.name || "N/A"}</td>
                <td>{score.student?.admissionNumber || "N/A"}</td>
                <td>{score.subject?.name || "N/A"}</td>
                <td>{score.form || "N/A"}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={score.editableScore}
                    onChange={(e) => handleScoreChange(score._id, e.target.value)}
                    disabled={updatingId === score._id}
                    style={{ width: "60px" }}
                  />
                </td>
                <td>{score.teacher?.name || "N/A"}</td>
                <td>{new Date(score.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    onClick={() => handleUpdateScore(score._id)}
                    disabled={updatingId === score._id}
                  >
                    {updatingId === score._id ? "Updating..." : "Update"}
                  </button>
                  <div style={{ fontSize: "0.8em", color: score.updateMessage?.startsWith("❌") ? "red" : "green" }}>
                    {score.updateMessage}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DosScoresView;
