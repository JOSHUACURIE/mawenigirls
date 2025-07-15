// TeacherList.jsx
import React from "react";
import { useState } from "react";
import "./TeacherList.css"; // keep your CSS

const TeacherList = ({ teachers, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!teachers || teachers.length === 0) {
    return <p className="no-teachers-msg">No teachers found.</p>;
  }

  // Filter teachers by name or email
  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="teacher-list-container">
      <h3 className="teacher-list-title">👩‍🏫 All Teachers</h3>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <table className="teacher-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Assigned Subjects</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTeachers.map((teacher) => (
            <tr key={teacher._id}>
              <td data-label="Name">{teacher.name}</td>
              <td data-label="Email">{teacher.email}</td>
              <td data-label="Assigned Subjects">
                {Array.isArray(teacher.assignedSubjects) &&
                teacher.assignedSubjects.length > 0 ? (
                  <ul className="subject-list">
                    {teacher.assignedSubjects.map((subj, index) => (
                      <li key={index}>
                        {typeof subj === "object" && subj.name ? subj.name : subj}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="no-subject">None</span>
                )}
              </td>
              <td data-label="Actions">
                <button className="edit-btn" onClick={() => onEdit(teacher)}>
                  ✏️ Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => onDelete(teacher._id)}
                >
                  🗑️ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Show count of filtered results */}
      <p className="result-count">
        Showing {filteredTeachers.length} of {teachers.length} teachers
      </p>
    </div>
  );
};

export default TeacherList;