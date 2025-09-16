import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import api from "../services/api";
import "./enterscore.css";

const EnterScoresForm = ({ teacher }) => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [scores, setScores] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch teacher's assigned subjects with student info
  useEffect(() => {
    const fetchAssignedSubjects = async () => {
      setLoading(true);
      setMessage("");
      try {
        const res = await api.get(`/teachers/me/subjects`);
        if (res.data && Array.isArray(res.data.subjects)) {
          setSubjects(res.data.subjects);
        } else {
          setSubjects([]);
        }
      } catch (err) {
        console.error("❌ Error fetching subjects:", err.message);
        setMessage("Failed to load assigned subjects.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedSubjects();
  }, []);

  // Update students when subject changes
  useEffect(() => {
    if (!selectedSubject) {
      setStudents([]);
      setScores([]);
      return;
    }

    const subject = subjects.find((s) => s._id === selectedSubject);
    if (subject) {
      const studentList = subject.students || [];
      setStudents(studentList);
      setScores(studentList.map((s) => ({ studentId: s._id, score: "" })));
    } else {
      setStudents([]);
      setScores([]);
    }
  }, [selectedSubject, subjects]);

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
      (entry) => entry.score === "" || isNaN(entry.score) || Number(entry.score) < 0 || Number(entry.score) > 100
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
        scores: scores.map((entry) => ({ studentId: entry.studentId, score: Number(entry.score) })),
      });

      setMessage("✅ Scores submitted successfully!");
      setScores(scores.map((score) => ({ ...score, score: "" })));
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
          disabled={subjects.length === 0 || saving}
        >
          <option value="">-- Select Subject --</option>
          {subjects.map((subject) => (
            <option key={subject._id} value={subject._id}>
              {subject.name} ({subject.form})
            </option>
          ))}
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
                      onChange={(e) => handleScoreChange(index, e.target.value)}
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
};

export default EnterScoresForm;
