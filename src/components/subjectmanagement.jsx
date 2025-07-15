import { useEffect, useState } from "react";
import api from "../services/api";
import "./SubjectManagement.css";

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [newSubject, setNewSubject] = useState({
    name: "",
    form: "",
    teacherId: "",
  });
  const [error, setError] = useState("");

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      setSubjects(res.data);
    } catch (err) {
      console.error("❌ Failed to load subjects", err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get("/teachers");
      setTeachers(res.data);
    } catch (err) {
      console.error("❌ Failed to load teachers", err);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchTeachers();
  }, []);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    const { name, form, teacherId } = newSubject;
    if (!name.trim() || !form || !teacherId) {
      setError("❌ Subject name, form, and teacher are required.");
      return;
    }

    try {
      await api.post("/subjects", {
        name: name.trim(),
        form,
        teacherId,
      });
      setNewSubject({ name: "", form: "", teacherId: "" });
      setError("");
      fetchSubjects();
    } catch (err) {
      console.error("❌ Error adding subject:", err);
      setError(err.response?.data?.message || "Failed to add subject.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject?")) return;
    try {
      await api.delete(`/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      console.error("❌ Error deleting subject:", err);
    }
  };

  return (
    <div className="subject-container">
      <h3 className="subject-title">📚 Subject Management</h3>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleAddSubject} className="subject-form">
        {/* Subject Name */}
        <input
          type="text"
          placeholder="Enter subject name"
          value={newSubject.name}
          onChange={(e) =>
            setNewSubject({ ...newSubject, name: e.target.value })
          }
          required
        />

        {/* Form Dropdown */}
        <select
          value={newSubject.form}
          onChange={(e) =>
            setNewSubject({ ...newSubject, form: e.target.value })
          }
          required
        >
          <option value="">-- Select Form --</option>
          <option value="Form 1">Form 1</option>
          <option value="Form 2">Form 2</option>
          <option value="Form 3">Form 3</option>
          <option value="Form 4">Form 4</option>
        </select>

        {/* Teacher Dropdown */}
        <select
          value={newSubject.teacherId}
          onChange={(e) =>
            setNewSubject({ ...newSubject, teacherId: e.target.value })
          }
          required
        >
          <option value="">-- Assign Teacher --</option>
          {teachers.map((teacher) => (
            <option key={teacher._id} value={teacher._id}>
              {teacher.name}
            </option>
          ))}
        </select>

        <button type="submit">➕ Add Subject</button>
      </form>

      {/* Subject List */}
      <ul className="subject-list">
        {subjects.map((subj) => (
          <li key={subj._id} className="subject-item">
            <strong>{subj.name}</strong> — <em>{subj.form}</em>{" "}
            {subj.assignedTeacher ? (
              <span className="assigned">— {subj.assignedTeacher.name}</span>
            ) : (
              <span className="unassigned">— No teacher assigned</span>
            )}
            <button
              className="delete-btn"
              onClick={() => handleDelete(subj._id)}
            >
              ❌ Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubjectManagement;
