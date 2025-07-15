// TeacherForm.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./TeacherForm.css";

const TeacherForm = ({ onSubmit, editingTeacher, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    assignedSubjects: [],
  });

  const [allSubjects, setAllSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const res = await api.get("/subjects");
        setAllSubjects(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch subjects:", err.message);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (editingTeacher) {
      setFormData({
        name: editingTeacher.name || "",
        email: editingTeacher.email || "",
        password: "",
        assignedSubjects:
          editingTeacher.assignedSubjects?.map((subj) =>
            typeof subj === "object" ? subj._id : subj
          ) || [],
      });
    }
  }, [editingTeacher]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubjectChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const updatedSubjects = checked
        ? [...prev.assignedSubjects, value]
        : prev.assignedSubjects.filter((id) => id !== value);
      return { ...prev, assignedSubjects: updatedSubjects };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!editingTeacher && !formData.password.trim()) {
      newErrors.password = "Password is required when creating a new teacher";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit(formData); // ✅ consistent usage
      setFormData({
        name: "",
        email: "",
        password: "",
        assignedSubjects: [],
      });
      setErrors({});
    } catch (err) {
      console.error("❌ Error submitting teacher:", err.message);
    }
  };

  return (
    <form className="teacher-form" onSubmit={handleSubmit}>
      <h3 className="form-title">
        {editingTeacher ? "✏️ Edit Teacher" : "➕ Add Teacher"}
      </h3>

      <div className="form-group">
        <label>Name:</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full name"
          required
        />
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label>Email:</label>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="teacher@example.com"
          required
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      {!editingTeacher && (
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />
          {errors.password && (
            <span className="error-text">{errors.password}</span>
          )}
        </div>
      )}

      <div className="form-group">
        <label>Assigned Subjects:</label>
        {loadingSubjects ? (
          <p className="loading-msg">Loading subjects...</p>
        ) : (
          <div className="subjects-checkboxes">
            {allSubjects.map((subject) => (
              <label key={subject._id} className="subject-checkbox">
                <input
                  type="checkbox"
                  value={subject._id}
                  checked={formData.assignedSubjects.includes(subject._id)}
                  onChange={handleSubjectChange}
                />
                {subject.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="form-buttons">
        <button type="submit" className="submit-btn">
          {editingTeacher ? "Update" : "Add"} Teacher
        </button>
        {editingTeacher && (
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TeacherForm;
