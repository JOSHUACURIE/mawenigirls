import React, { useEffect, useState } from "react";
import { getAssignedSubjects } from "../services/api";

const AssignedSubjectsList = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await getAssignedSubjects();

        if (!response.data || !response.data.subjects) {
          throw new Error("No data received from server");
        }

        setSubjects(response.data.subjects);
      } catch (err) {
        console.error("Error loading subjects:", err);

        let errorMessage = "Failed to load assigned subjects";
        if (err.response) {
          errorMessage = err.response.data?.message || err.response.statusText;
        } else if (err.request) {
          errorMessage = "Network error - please check your connection";
        } else if (err.message.includes("token")) {
          errorMessage = "Session expired - please log in again";
        }

        setError(errorMessage);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [retryCount]);

  const handleRetry = () => setRetryCount((prev) => prev + 1);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your subjects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mx-auto" style={{ maxWidth: "500px" }}>
        <h4 className="alert-heading">Error</h4>
        <p>{error}</p>
        <div className="d-flex justify-content-between">
          <button className="btn btn-primary" onClick={handleRetry}>
            Retry
          </button>
          {error.includes("Session expired") && (
            <button className="btn btn-secondary" onClick={handleLogout}>
              Go to Login
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">📚 My Assigned Subjects</h3>
        </div>
        <div className="card-body">
          {subjects.length === 0 ? (
            <div className="alert alert-info">
              No subjects currently assigned to you.
            </div>
          ) : (
            <ul className="list-group">
              {subjects.map((subject) => (
                <li
                  key={subject._id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>{subject.name}</strong> - Form {subject.form}
                  </div>
                  <span className="badge bg-primary rounded-pill">
                    {subject.studentCount} students
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignedSubjectsList;
