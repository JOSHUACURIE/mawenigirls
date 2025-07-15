import React, { useState, useEffect } from "react";
import AddStudentForm from "../components/AddStudentForm";
import StudentList from "../components/StudentList";
import TeacherManagement from "../components/TeacherManagement";
import SubjectManagement from "../components/subjectmanagement";
import DosScoresView from "../components/DOSScoreOverview";
import DosResultsAnalysis from "../components/DOSanalysis";  // <-- Import here
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./DOSDashboard.css";
import ResultAnalysis from "../components/resultAnalysis";
import DOSResultsAnalysis from "../components/DOSanalysis";

const DOSDashboard = () => {
  const [activeTab, setActiveTab] = useState("add");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/subjects");
        setSubjects(res.data);
      } catch (err) {
        console.error("❌ Error fetching subjects:", err.message);
      }
    };
    fetchSubjects();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "add":
        return <AddStudentForm />;
      case "view":
        return <StudentList />;
      case "teachers":
        return <TeacherManagement />;
      case "subjects":
        return <SubjectManagement />;
      case "scores":
        return <DosScoresView subjects={subjects} />;
      case "analysis":
        return <DOSResultsAnalysis />;   // <-- New case here
      default:
        return <p>Select a tab</p>;
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const tabButtonStyle = (tab) => ({
    backgroundColor: activeTab === tab ? "#cceeff" : "#ffffff",
    fontWeight: activeTab === tab ? "bold" : "normal",
  });

  return (
    <div className="dos-dashboard">
      <button className="toggle-button" onClick={toggleSidebar}>
        ☰
      </button>

      <div className={`dos-sidebar ${sidebarOpen ? "open" : ""}`}>
        <h3 className="dos-title">📘 DOS Dashboard</h3>

        <button
          className="dos-tab-btn"
          onClick={() => {
            setActiveTab("add");
            setSidebarOpen(false);
          }}
          style={tabButtonStyle("add")}
        >
          ➕ Add Student
        </button>

        <button
          className="dos-tab-btn"
          onClick={() => {
            setActiveTab("view");
            setSidebarOpen(false);
          }}
          style={tabButtonStyle("view")}
        >
          📋 View Students
        </button>

        <button
          className="dos-tab-btn"
          onClick={() => {
            setActiveTab("teachers");
            setSidebarOpen(false);
          }}
          style={tabButtonStyle("teachers")}
        >
          👩‍🏫 Manage Teachers
        </button>

        <button
          className="dos-tab-btn"
          onClick={() => {
            setActiveTab("subjects");
            setSidebarOpen(false);
          }}
          style={tabButtonStyle("subjects")}
        >
          📚 Manage Subjects
        </button>

        <button
          className="dos-tab-btn"
          onClick={() => {
            setActiveTab("scores");
            setSidebarOpen(false);
          }}
          style={tabButtonStyle("scores")}
        >
          📊 View Submitted Scores
        </button>

        {/* New tab button for results analysis */}
        <button
          className="dos-tab-btn"
          onClick={() => {
            setActiveTab("analysis");
            setSidebarOpen(false);
          }}
          style={tabButtonStyle("analysis")}
        >
          📈 Analyze Results
        </button>

        <hr className="dos-divider" />

        <button className="dos-logout-btn" onClick={handleLogout}>
          🔒 Logout
        </button>
      </div>

      <div className="dos-main-content">
        <h2 className="dos-heading">
          {{
            add: "➕ Add New Student",
            view: "📋 All Students",
            teachers: "👩‍🏫 Teacher Management",
            subjects: "📚 Subject Management",
            scores: "📊 Submitted Scores",
            analysis: "📈 Results Analysis",
          }[activeTab] || "📊 Dashboard"}
        </h2>

        <div className="dos-content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default DOSDashboard;
