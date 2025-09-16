import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import api from "../services/api";
import './enterscore.css';

const EnterScoresForm = ({ teacher, subjects = [] }) => {
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [scores, setScores] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const validSubjects = Array.isArray(subjects) ? subjects : [];

  useEffect(() => {
    const fetchStudentsForSubject = async () => {
      if (!selectedSubject) return;

      setLoading(true);
      setMessage("");
      try {
        const studentRes = await api.get(`/students/by-subject/${selectedSubject}`);
        const studentList = Array.isArray(studentRes.data) ? studentRes.data : [];

        setStudents(studentList);
        setScores(studentList.map(s => ({ studentId: s._id, score: "" })));
      } catch (err) {
        console.error("❌ Error fetching students:", err.message);
        setMessage("Failed to load students.");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsForSubject();
  }, [selectedSubject]);

  const handleScoreChange = (index, value) => {
    if (value === "" || (/^\d{1,3}$/.test(value) && Number(value) <= 100)) {
      const updated = [...scores];
      updated[index].score = value;
      setScores(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const invalidScores = scores.filter(
      entry => entry.score === "" || isNaN(entry.score) || Number(entry.score) < 0 || Number(entry.score) > 100
    );
    if (invalidScores.length > 0) {
      setMessage("❌ Please enter valid scores (0-100) for all students.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await api.post("/scores/submit", {
        teacherId: teacher._id,
        subjectId: selectedSubject,
        scores: scores.map(entry => ({ studentId: entry.studentId, score: Number(entry.score) })),
      });

      setMessage("✅ Scores submitted successfully!");
      setScores(scores.map(score => ({ ...score, score: "" })));
    } catch (err) {
      console.error("❌ Error submitting scores:", err.message);
      setMessage("❌ Failed to submit scores. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="enter-scores-form">
      <h3>📝 Submit Scores</h3>

      {message && (
        <p className={`form-message ${message.startsWith("✅") ? "success" : "error"}`}>
          {message}
        </p>
      )}

      <div className="form-group">
        <label>Select Subject:</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          required
          disabled={validSubjects.length === 0 || saving}
        >
          <option value="">-- Select Subject --</option>
          {validSubjects.length > 0 ? (
            validSubjects.map(subject => (
              <option key={subject._id} value={subject._id}>
                {subject.name} ({subject.form})
              </option>
            ))
          ) : (
            <option value="" disabled>No subjects available</option>
          )}
        </select>
      </div>

      {loading ? (
        <p>Loading students...</p>
      ) : students.length > 0 ? (
        <form onSubmit={handleSubmit}>
          <table className="scores-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Score (0-100)</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      value={scores[index]?.score || ""}
                      onChange={e => handleScoreChange(index, e.target.value)}
                      required
                      disabled={saving}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="form-actions">
            <button type="submit" disabled={saving || !selectedSubject}>
              {saving ? "Submitting..." : "📤 Submit Scores"}
            </button>
          </div>
        </form>
      ) : (
        selectedSubject && <p>No students found for this subject.</p>
      )}
    </div>
  );
};

EnterScoresForm.propTypes = {
  teacher: PropTypes.object.isRequired,
  subjects: PropTypes.array,
};

EnterScoresForm.defaultProps = {
  subjects: [],
};

export default EnterScoresForm;
