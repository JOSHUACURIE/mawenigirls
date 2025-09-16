import React, { useEffect, useState } from "react";
import EnterScoresForm from "../components/Enterscoreform";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const TeacherDashboard = () => {
  const [tab, setTab] = useState("subjects");
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [errorSubjects, setErrorSubjects] = useState(null);
  const [selectedSubjectForScores, setSelectedSubjectForScores] = useState("");

  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  // Fetch assigned subjects (for both tabs)
  useEffect(() => {
    const fetchAssignedSubjects = async () => {
      setLoadingSubjects(true);
      setErrorSubjects(null);
      try {
        const res = await api.get("/teachers/me/subjects");
        const subjects = res.data?.subjects ?? [];
        setAssignedSubjects(subjects);
      } catch (err) {
        console.error("❌ Failed to fetch assigned subjects:", err.message);
        setErrorSubjects(err.response?.data?.message || "Failed to load subjects.");
        setAssignedSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchAssignedSubjects();
  }, []);

  // Switch to scores tab when a subject is clicked
  const handleSubjectClick = (subjectId) => {
    setSelectedSubjectForScores(subjectId);
    setTab("scores");
  };

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

        {/* Subjects Tab */}
        {tab === "subjects" && (
          <>
            {loadingSubjects && <p>Loading subjects...</p>}
            {errorSubjects && <p style={{ color: "red" }}>{errorSubjects}</p>}
            {!loadingSubjects && !errorSubjects && assignedSubjects.length === 0 && (
              <div>No subjects currently assigned to you.</div>
            )}
            {!loadingSubjects && !errorSubjects && assignedSubjects.length > 0 && (
              <ul className="list-group">
                {assignedSubjects.map((subject) => (
                  <li
                    key={subject._id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSubjectClick(subject._id)}
                  >
                    <div>
                      <strong>{subject.name}</strong> - Form {subject.form}
                    </div>
                    <span className="badge bg-primary rounded-pill">
                      {subject.students?.length ?? 0} students
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* Scores Tab */}
        {tab === "scores" && (
          <>
            {loadingSubjects && <p>Loading subjects...</p>}
            {errorSubjects && <p style={{ color: "red" }}>{errorSubjects}</p>}
            {!loadingSubjects && !errorSubjects && (
              <EnterScoresForm
                teacher={user}
                subjects={assignedSubjects}
                selectedSubject={selectedSubjectForScores}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
