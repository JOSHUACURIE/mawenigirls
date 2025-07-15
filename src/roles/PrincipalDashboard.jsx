import React, { useState, useContext } from "react";
import {
  generateResults,
  exportResults,
  downloadClassResults,
  sendResultsSMS,
} from "../api/resulstsapi";
import { saveAs } from "file-saver";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./principal.css";

const PrincipalDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [results, setResults] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateResults();
      setResults(res.data);

      const subjects = {};
      res.data.forEach((result) => {
        result.scores.forEach((s) => {
          if (!subjects[s.subject]) subjects[s.subject] = [];
          subjects[s.subject].push(s.marks);
        });
      });

      const averages = Object.entries(subjects).map(([subject, marks]) => ({
        subject,
        average: (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(2),
      }));

      setChartData(averages);
      alert("✅ Results generated");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const handleExportAll = async () => {
    setLoading(true);
    try {
      const res = await exportResults();
      saveAs(new Blob([res.data]), "All_Results.xlsx");
    } catch (err) {
      alert("❌ Export failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadClass = async () => {
    setLoading(true);
    try {
      const res = await downloadClassResults("Form 4", "North");
      saveAs(new Blob([res.data]), "Form4_North_Results.xlsx");
    } catch (err) {
      alert("❌ Failed to download class results");
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async () => {
    setLoading(true);
    try {
      await sendResultsSMS();
      alert("✅ SMS sent");
    } catch (err) {
      alert("❌ Failed to send SMS");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("results-table");
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = 210;
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 10, width, height);
    pdf.save("Results_Report.pdf");
  };

  return (
    <div className="principal-dashboard">
      <div className={`principal-sidebar ${sidebarOpen ? "open" : ""}`}>
        <h3>📊 Principal Panel</h3>
        <button onClick={handleGenerate}>🔄 Generate Results</button>
        <button onClick={handleExportAll}>📥 Export All Results</button>
        <button onClick={handleDownloadClass}>🧾 Download Class Results</button>
        <button onClick={handleSendSMS}>📩 Send SMS</button>
        <button onClick={handleDownloadPDF}>🖨️ Download PDF</button>
        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </div>

      <div className="principal-main">
        <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>

        <h2>📈 Student Performance</h2>
        {loading && <p className="loading">⏳ Processing...</p>}

        {chartData.length > 0 && (
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="average" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {results.length > 0 && (
          <div id="results-table" className="results-table">
            <h3>📋 Analyzed Results</h3>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Adm No</th>
                  <th>Stream</th>
                  <th>Total</th>
                  <th>Grade</th>
                  <th>Stream Rank</th>
                  <th>Overall Rank</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res, index) => (
                  <tr key={index}>
                    <td>{res.student.name}</td>
                    <td>{res.student.admissionNumber}</td>
                    <td>{res.student.stream}</td>
                    <td>{res.totalMarks}</td>
                    <td>{res.grade}</td>
                    <td>{res.streamRanking || "-"}</td>
                    <td>{res.overallRanking || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrincipalDashboard;
