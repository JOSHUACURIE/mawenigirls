import React, { useState, useEffect } from "react";
import api from "../services/api";
import "./SubjectForm.css";

const SubjectForm = ({ onSave, selectedSubject, onCancel }) => {
  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [form, setForm] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoadingTeachers(true);
      try {
        const res = await api.get("/teachers");
        setTeachers(res.data);
      } catch (error) {
        console.error("❌ Failed to fetch teachers:", error.message);
      } finally {
        setLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      setName(selectedSubject.name || "");
      setTeacher(
        selectedSubject.assignedTeacher?._id ||
        selectedSubject.assignedTeacher ||
        ""
      );
      setForm(selectedSubject.form || "");
    } else {
      setName("");
      setTeacher("");
      setForm("");
    }
  }, [selectedSubject]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!name.trim()) newErrors.name = "Subject name is required.";
    if (!form) newErrors.form = "Please select the form.";
    if (!teacher) newErrors.teacher = "Please select a teacher.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSave({
      _id: selectedSubject?._id,
      name,
      form,
      teacherId: teacher, // ✅ FIXED HERE
    });

    setName("");
    setForm("");
    setTeacher("");
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="subject-form">
      <h3>{selectedSubject ? "✏️ Edit Subject" : "➕ Add New Subject"}</h3>

      {/* Subject Name */}
      <div className="form-group">
        <label>📚 Subject Name:</label>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="E.g., Chemistry"
          className={errors.name ? "input-error" : ""}
        />
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>

      {/* Form Selection */}
      <div className="form-group">
        <label>🏫 Select Form:</label>
        <select
          name="form"
          value={form}
          onChange={(e) => setForm(e.target.value)}
          className={errors.form ? "input-error" : ""}
        >
          <option value="">-- Select Form --</option>
          <option value="Form 1">Form 1</option>
          <option value="Form 2">Form 2</option>
          <option value="Form 3">Form 3</option>
          <option value="Form 4">Form 4</option>
        </select>
        {errors.form && <span className="error-text">{errors.form}</span>}
      </div>

      {/* Teacher Selection */}
      <div className="form-group">
        <label>👨‍🏫 Assign Teacher:</label>
        {loadingTeachers ? (
          <p className="loading-msg">Loading teachers...</p>
        ) : (
          <select
            name="teacher"
            value={teacher}
            onChange={(e) => setTeacher(e.target.value)}
            className={errors.teacher ? "input-error" : ""}
          >
            <option value="">-- Select Teacher --</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} ({t.email})
              </option>
            ))}
          </select>
        )}
        {errors.teacher && <span className="error-text">{errors.teacher}</span>}
      </div>

      {/* Buttons */}
      <div className="form-actions">
        <button type="submit" className="submit-btn">
          {selectedSubject ? "Update Subject" : "Add Subject"}
        </button>
        {selectedSubject && (
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default SubjectForm;
