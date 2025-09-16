import React, { useState, useEffect } from "react";
import AddStudentForm from "../components/AddStudentForm";
import StudentList from "../components/StudentList";
import TeacherManagement from "../components/TeacherManagement";
import SubjectManagement from "../components/subjectmanagement";
import DosScoresView from "../components/DOSScoreOverview";
import DOSResultsAnalysis from "../components/DOSanalysis";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./DOSDashboard.css";

const DOSDashboard = () => {
  const [activeTab, setActiveTab] = useState("add");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [gradingMethod, setGradingMethod] = useState("points");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStream, setSelectedStream] = useState("");
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  const { logout } = useAuth();

  // Fetch subjects on load
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const tabButtonStyle = (tab) => ({
    backgroundColor: activeTab === tab ? "#cceeff" : "#ffffff",
    fontWeight: activeTab === tab ? "bold" : "normal",
  });

  // ==================== RESULTS HANDLERS ====================
  const handleGenerateResults = async () => {
    if (!selectedClass || !selectedStream) {
      alert("Please select class and stream");
      return;
    }

    try {
      setLoadingResults(true);
      const res = await api.post("/results/generate", {
        class: selectedClass,
        stream: selectedStream,
      });
      setResults(res.data);
    } catch (err) {
      console.error("❌ Error generating results:", err.message);
      alert("Failed to generate results");
    } finally {
      setLoadingResults(false);
    }
  };

  const handleExportExcel = async () => {
    if (!selectedClass || !selectedStream) {
      alert("Please select class and stream");
      return;
    }

    try {
      const res = await api.get("/results/export", {
        params: { class: selectedClass, stream: selectedStream },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${selectedClass}_${selectedStream}_results.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("❌ Error exporting results:", err.message);
      alert("Failed to export results");
    }
  };

  const handleSendSMS = async () => {
    if (!selectedClass || !selectedStream) {
      alert("Please select class and stream");
      return;
    }

    try {
      await api.post("/results/send-sms", {
        class: selectedClass,
        stream: selectedStream,
      });
      alert("SMS sent successfully!");
    } catch (err) {
      console.error("❌ Error sending SMS:", err.message);
      alert("Failed to send SMS");
    }
  };

  // ==================== RENDER CONTENT ====================
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
        return (
          <div>
            <div className="results-controls">
              <label>
                Class:{" "}
                <input
                  type="text"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  placeholder="e.g. Form 1"
                />
              </label>
              <label>
                Stream:{" "}
                <input
                  type="text"
                  value={selectedStream}
                  onChange={(e) => setSelectedStream(e.target.value)}
                  placeholder="e.g. A"
                />
              </label>
              <label>
                Grading System:{" "}
                <select
                  value={gradingMethod}
                  onChange={(e) => setGradingMethod(e.target.value)}
                >
                  <option value="points">Points</option>
                  <option value="totalMarks">Total Marks</option>
                </select>
              </label>
              <button onClick={handleGenerateResults} disabled={loadingResults}>
                {loadingResults ? "Generating..." : "Generate Results"}
              </button>
              <button onClick={handleExportExcel}>Export to Excel</button>
              <button onClick={handleSendSMS}>Send Results via SMS</button>
            </div>
            <DOSResultsAnalysis results={results} gradingMethod={gradingMethod} />
          </div>
        );
      default:
        return <p>Select a tab</p>;
    }
  };

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
