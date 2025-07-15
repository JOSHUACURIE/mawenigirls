import React, { useEffect, useState } from "react";
import axios from "axios";

const StudentScores = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editScore, setEditScore] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/scores/my-subject", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setScores(res.data);
      } catch (error) {
        console.error("Failed to fetch scores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  const handleEdit = (score) => {
    setEditingId(score._id);
    setEditScore({ marks: score.marks });
  };

  const handleChange = (e) => {
    setEditScore({ ...editScore, marks: e.target.value });
  };

  const handleUpdate = async (scoreId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/scores/${scoreId}`,
        { marks: editScore.marks },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setScores((prev) =>
        prev.map((s) =>
          s._id === scoreId ? { ...s, marks: editScore.marks } : s
        )
      );
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update score:", error);
    }
  };

  if (loading) return <p>Loading scores...</p>;

  return (
    <div>
      <h3>My Subject Scores</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Subject</th>
            <th>Marks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score) => (
            <tr key={score._id}>
              <td>{score.student.name}</td>
              <td>{score.subject.name}</td>
              <td>
                {editingId === score._id ? (
                  <input
                    type="number"
                    value={editScore.marks}
                    onChange={handleChange}
                  />
                ) : (
                  score.marks
                )}
              </td>
              <td>
                {editingId === score._id ? (
                  <>
                    <button onClick={() => handleUpdate(score._id)}>
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => handleEdit(score)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentScores;
