import React, { useState } from "react";
import api from "../services/api"; // Your axios instance

const ResultAnalysis = () => {
  const [className, setClassName] = useState("");
  const [stream, setStream] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Call /generate to analyze results
  const handleAnalyzeResults = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/generate", {
        studentsHaveChosenSubjects: true,
      });
      setMessage("✅ Results analyzed successfully!");
      console.log("Analyzed Results:", res.data);
    } catch (error) {
      setMessage("❌ Failed to analyze results: " + error.message);
    }
    setLoading(false);
  };

  // Export all results to Excel, triggers file download
  const handleExportExcel = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await api.post(
        "/results/export",
        {
          studentsHaveChosenSubjects: true,
        },
        {
          responseType: "blob", // important for file download
        }
      );

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "results.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage("✅ Excel exported successfully!");
    } catch (error) {
      setMessage("❌ Failed to export Excel: " + error.message);
    }
    setLoading(false);
  };

  // Download class/stream-specific results
  const handleDownloadClassResults = async () => {
    if (!className || !stream) {
      setMessage("❌ Please enter both class and stream.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      // Build query params
      const params = new URLSearchParams({ className, stream });

      const res = await api.get(`/results/download-class?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${className}_${stream}_results.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage("✅ Class results downloaded successfully!");
    } catch (error) {
      setMessage("❌ Failed to download class results: " + error.message);
    }
    setLoading(false);
  };

  // Send SMS to parents
  const handleSendSMS = async () => {
    setLoading(true);
    setMessage("");
    try {
      await api.post("/results/send-sms", { studentsHaveChosenSubjects: true });
      setMessage("✅ SMS sent to all parents successfully!");
    } catch (error) {
      setMessage("❌ Failed to send SMS: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="result-analysis">
      <h3>📊 Result Analysis & Reporting</h3>

      <button onClick={handleAnalyzeResults} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Results"}
      </button>

      <button 
        onClick={handleExportExcel} 
        disabled={loading} 
        style={{ marginLeft: "1rem" }}
      >
        {loading ? "Exporting..." : "Export All to Excel"}
      </button>

      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <label>
          Class:{" "}
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g. Form 1"
          />
        </label>
        <label style={{ marginLeft: "1rem" }}>
          Stream:{" "}
          <input
            type="text"
            value={stream}
            onChange={(e) => setStream(e.target.value)}
            placeholder="e.g. A"
          />
        </label>
        <button 
          onClick={handleDownloadClassResults} 
          disabled={loading} 
          style={{ marginLeft: "1rem" }}
        >
          {loading ? "Downloading..." : "Download Class Results"}
        </button>
      </div>

      <button onClick={handleSendSMS} disabled={loading}>
        {loading ? "Sending SMS..." : "Send SMS to Parents"}
      </button>

      {message && (
        <p style={{ marginTop: "1rem", fontWeight: "bold" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default ResultAnalysis;