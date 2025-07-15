import React, { useState } from "react";
import "./SubjectList.css"; // keep your existing CSS

const SubjectList = ({ subjects, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!subjects || subjects.length === 0) {
    return <p className="no-subjects">No subjects found.</p>;
  }

  // Filter by subject name or teacher name/email
  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="subject-list-container">
      <h3 className="subject-list-title">📋 All Subjects</h3>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by subject name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <table className="subject-table">
        <thead>
          <tr>
            <th>Subject Name</th>
            <th>Form</th>
            <th>Assigned Teacher</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSubjects.map((subject) => (
            <tr key={subject._id}>
              <td data-label="Subject">{subject.name}</td>
              <td data-label="Form">{subject.form || "N/A"}</td>
              <td data-label="Teacher">
                {subject.assignedTeacher ? (
                  <>
                    {subject.assignedTeacher.name}{" "}
                    <span className="teacher-email">
                      ({subject.assignedTeacher.email})
                    </span>
                  </>
                ) : (
                  <span className="no-teacher">None</span>
                )}
              </td>
              <td data-label="Actions">
                <button className="edit-btn" onClick={() => onEdit(subject)}>
                  ✏️ Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => onDelete(subject._id)}
                >
                  🗑️ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="result-count">
        Showing {filteredSubjects.length} of {subjects.length} subjects
      </p>
    </div>
  );
};

export default SubjectList;
