// TeacherManagement.jsx
import { useState, useEffect } from "react";
import api from "../services/api"; // ✅ Using centralized API with token interceptor
import TeacherForm from "./TeacherForm";
import TeacherList from "./TeacherList";
import "./TeacherManagement.css";

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔁 Fetch all teachers
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/teachers"); // ✅ Uses token via interceptor
      setTeachers(res.data);
      setError("");
    } catch (err) {
      console.error("❌ Failed to load teachers:", err.message);
      setError(err.response?.data?.message || "Failed to load teachers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // 💾 Add or update teacher
  const handleSubmit = async (formData) => {
    try {
      if (editingTeacher) {
        await api.put(`/teachers/${editingTeacher._id}`, formData); // ✅ Uses token
      } else {
        await api.post("/teachers", formData); // ✅ Uses token
      }

      setEditingTeacher(null);
      fetchTeachers();
      setError("");
    } catch (err) {
      console.error("❌ Error saving teacher:", err.message);
      const message = err.response?.data?.message || "Error saving teacher.";
      setError(message);
    }
  };

  // 🗑️ Delete teacher
  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this teacher?");
    if (!confirm) return;

    try {
      await api.delete(`/teachers/${id}`); // ✅ Uses token
      fetchTeachers();
      setError("");
    } catch (err) {
      console.error("❌ Error deleting teacher:", err.message);
      setError("Error deleting teacher.");
    }
  };

  return (
    <div className="teacher-management-container">
      <h3 className="teacher-management-title">📚 Manage Teachers</h3>

      {/* Loading Feedback */}
      {loading && <p className="loading-text">🔄 Loading teachers...</p>}

      {/* Error Message */}
      {error && <p className="teacher-error">{error}</p>}

      {/* 👨‍🏫 Add / Edit Form */}
      <div className="teacher-form-section">
        <h4>{editingTeacher ? "✏️ Edit Teacher" : "➕ Add New Teacher"}</h4>
        <TeacherForm
          onSubmit={handleSubmit}
          editingTeacher={editingTeacher}
          onCancel={() => setEditingTeacher(null)}
        />
      </div>

      {/* 📋 Teacher List */}
      <div className="teacher-list-section">
        <h4>🧑‍🏫 All Teachers</h4>
        <TeacherList
          teachers={teachers}
          onEdit={setEditingTeacher}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default TeacherManagement;