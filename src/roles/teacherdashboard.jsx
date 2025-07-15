import React, { useEffect, useState } from "react";
import EnterScoresForm from "../components/Enterscoreform";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import AssignedSubjectsList from "../components/Assignedsubjectslist";

const TeacherDashboard = () => {
  const [tab, setTab] = useState("subjects");
  const [namedSubjects, setNamedSubjects] = useState([]);
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/teachers/me/subjects");
        const subjects = Array.isArray(res.data)
          ? res.data
          : typeof res.data === "object" && res.data.subjects
          ? res.data.subjects
          : [];
        setNamedSubjects(subjects);
      } catch (err) {
        console.error("❌ Failed to fetch assigned subjects:", err.message);
        setNamedSubjects([]);
      }
    };

    if (tab === "scores") {
      fetchSubjects();
    }
  }, [tab]);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Segoe UI, sans-serif" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "240px",
          background: "#ffffff",
          borderRight: "1px solid #e0e0e0",
          padding: "20px",
          boxShadow: "2px 0 5px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h2 style={{ marginBottom: "20px", fontSize: "20px" }}>👨‍🏫 Teacher Panel</h2>
        <p><strong>{user?.name}</strong></p>
        <hr style={{ margin: "20px 0" }} />

        <button
          onClick={() => setTab("subjects")}
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            backgroundColor: tab === "subjects" ? "#d0eaff" : "#f8f8f8",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📚 My Subjects
        </button>

        <button
          onClick={() => setTab("scores")}
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            backgroundColor: tab === "scores" ? "#d0eaff" : "#f8f8f8",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📝 Enter Scores
        </button>

        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#e53935",
            color: "white",
            padding: "12px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
            width: "100%",
            fontWeight: "bold",
          }}
        >
          🔒 Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "30px" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
          {tab === "subjects"
            ? "📚 Assigned Subjects"
            : tab === "scores"
            ? "📝 Enter Student Scores"
            : "Dashboard"}
        </h2>

        <div>
          {tab === "subjects" && <AssignedSubjectsList />}
          {tab === "scores" && (
            <EnterScoresForm
              teacher={user}
              subjects={Array.isArray(namedSubjects) ? namedSubjects : []}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
