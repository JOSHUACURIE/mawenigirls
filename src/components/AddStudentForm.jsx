// AddStudentForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { FaUser, FaHashtag, FaPhone, FaStream, FaListOl } from "react-icons/fa";
import "./AddStudent.css";
import api from "../services/api";

const AddStudentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    admissionNumber: "",
    stream: "",
    parentPhone: "",
    form: "", // ✅ replaced classLevel with form
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.admissionNumber.trim())
      newErrors.admissionNumber = "Admission number is required";
    if (!formData.form.trim()) newErrors.form = "Form/class is required";

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
      await api.post("/students", formData); // ✅ already using centralized API
      setMessage("✅ Student added successfully!");
      setFormData({
        name: "",
        admissionNumber: "",
        stream: "",
        parentPhone: "",
        form: "", // ✅ reset correct field
      });
      setErrors({});
    } catch (error) {
      console.error("❌ Error adding student:", error.response?.data?.message || error.message);
      setMessage(error.response?.data?.message || "❌ Error adding student.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 4000); // clear message after 4 seconds
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
