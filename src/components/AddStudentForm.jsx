import React, { useState, useEffect } from "react";
import { FaUser, FaHashtag, FaPhone, FaStream, FaListOl } from "react-icons/fa";
import api from "../services/api";
import "./AddStudent.css";

const AddStudentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    admissionNumber: "",
    stream: "",
    parentPhone: "",
    form: "",
    subjects: [],
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [subjectsList, setSubjectsList] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/subjects");
        setSubjectsList(res.data);
      } catch (err) {
        console.error("❌ Error fetching subjects:", err.message);
      }
    };
    fetchSubjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectsChange = (e) => {
    const options = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, subjects: options }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.admissionNumber.trim()) newErrors.admissionNumber = "Admission number is required";
    if (!formData.form.trim()) newErrors.form = "Form/class is required";
    if (formData.subjects.length === 0) newErrors.subjects = "Select at least one subject";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await api.post("/students", formData);
      setMessage("✅ Student added successfully!");
      setFormData({
        name: "",
        admissionNumber: "",
        stream: "",
        parentPhone: "",
        form: "",
        subjects: [],
      });
      setErrors({});
    } catch (error) {
      console.error("❌ Error adding student:", error.response?.data?.message || error.message);
      setMessage(error.response?.data?.message || "❌ Error adding student.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  return (
    <div className="add-student-container">
      <h3 className="form-title">➕ Add New Student</h3>

      <form className="student-form" onSubmit={handleSubmit}>
        {/* Name */}
        <div className={`input-group ${errors.name ? "has-error" : ""}`}>
          <FaUser className="input-icon" />
          <input
            type="text"
            name="name"
            placeholder="Student Name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        {errors.name && <p className="error-text">{errors.name}</p>}

        {/* Admission Number */}
        <div className={`input-group ${errors.admissionNumber ? "has-error" : ""}`}>
          <FaHashtag className="input-icon" />
          <input
            type="text"
            name="admissionNumber"
            placeholder="Admission Number"
            value={formData.admissionNumber}
            onChange={handleChange}
          />
        </div>
        {errors.admissionNumber && <p className="error-text">{errors.admissionNumber}</p>}

        {/* Stream */}
        <div className="input-group">
          <FaStream className="input-icon" />
          <input
            type="text"
            name="stream"
            placeholder="Stream (optional)"
            value={formData.stream}
            onChange={handleChange}
          />
        </div>

        {/* Parent Phone */}
        <div className="input-group">
          <FaPhone className="input-icon" />
          <input
            type="text"
            name="parentPhone"
            placeholder="Parent Phone (optional)"
            value={formData.parentPhone}
            onChange={handleChange}
          />
        </div>

        {/* Form */}
        <div className={`input-group ${errors.form ? "has-error" : ""}`}>
          <FaListOl className="input-icon" />
          <input
            type="text"
            name="form"
            placeholder="Form e.g. Form 2"
            value={formData.form}
            onChange={handleChange}
          />
        </div>
        {errors.form && <p className="error-text">{errors.form}</p>}

        {/* Subjects */}
        <div className={`input-group ${errors.subjects ? "has-error" : ""}`}>
          <label>Select Subjects:</label>
          <select
            multiple
            value={formData.subjects}
            onChange={handleSubjectsChange}
            size={subjectsList.length > 5 ? 5 : subjectsList.length}
          >
            {subjectsList.map((subj) => (
              <option key={subj._id} value={subj._id}>
                {subj.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="select-all-btn"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                subjects: subjectsList.map((s) => s._id),
              }))
            }
          >
            Select All
          </button>

          {/* Selected subjects tags */}
          <div className="selected-subjects">
            {formData.subjects.map((subjId) => {
              const subj = subjectsList.find((s) => s._id === subjId);
              if (!subj) return null;
              return (
                <span
                  key={subjId}
                  className="subject-tag"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      subjects: prev.subjects.filter((id) => id !== subjId),
                    }))
                  }
                >
                  {subj.name} &times;
                </span>
              );
            })}
          </div>
        </div>
        {errors.subjects && <p className="error-text">{errors.subjects}</p>}

        {/* Submit Button */}
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Adding..." : "Add Student"}
        </button>

        {/* Status Message */}
        {message && (
          <p className={`form-message ${message.startsWith("✅") ? "success" : "error"}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default AddStudentForm;
