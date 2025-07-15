// StudentList.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./StudentList.css";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 5;

  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students");
      console.log("📦 Response:", res.data);
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setStudents(data);
      setFiltered(data);
    } catch (err) {
      console.error("❌ Failed to load students:", err.message);
      setError("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  useEffect(() => {
    let results = [...students];
    if (search) {
      results = results.filter(
        (s) =>
          s.name?.toLowerCase().includes(search.toLowerCase()) ||
          s.admissionNumber?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (classFilter) {
      results = results.filter((s) => s.form === classFilter);
    }
    if (sortField) {
      results.sort((a, b) => {
        const valA = a[sortField]?.toLowerCase() || "";
        const valB = b[sortField]?.toLowerCase() || "";
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    setFiltered(results);
    setCurrentPage(1);
  }, [search, classFilter, students, sortField, sortOrder]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await api.delete(`/students/${id}`);
        fetchStudents();
      } catch (err) {
        console.error("❌ Error deleting student:", err.message);
        alert("Error deleting student");
      }
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student._id);
    setFormData({ ...student });
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/students/${editingStudent}`, formData);
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      console.error("❌ Error updating student:", err.message);
      alert("Error updating student");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const exportToExcel = () => {
    const data = filtered.map((s) => ({
      Name: s.name,
      AdmissionNumber: s.admissionNumber,
      Stream: s.stream,
      Class: s.form,
      ParentPhone: s.parentPhone,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(dataBlob, "students.xlsx");
  };

  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / studentsPerPage);

  return (
    <div className="student-list-container">
      <h3 className="student-list-title">📋 All Students</h3>

      {loading && <p className="loading-text">🔄 Loading students...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or admission number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="">All Classes</option>
          <option value="Form 1">Form 1</option>
          <option value="Form 2">Form 2</option>
          <option value="Form 3">Form 3</option>
          <option value="Form 4">Form 4</option>
        </select>
        <button className="export-btn" onClick={exportToExcel}>
          📄 Export Excel
        </button>
      </div>

      <div className="table-container">
        <table className="student-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("admissionNumber")}>Admission No</th>
              <th onClick={() => handleSort("name")}>Name</th>
              <th>Stream</th>
              <th onClick={() => handleSort("form")}>Class</th>
              <th>Parent Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.length === 0 && !loading ? (
              <tr>
                <td colSpan="6">No students found.</td>
              </tr>
            ) : (
              currentStudents.map((student) =>
                editingStudent === student._id ? (
                  <tr key={student._id} className="editing-row">
                    <td>{student.admissionNumber}</td>
                    <td>
                      <input name="name" value={formData.name} onChange={handleChange} />
                    </td>
                    <td>
                      <input name="stream" value={formData.stream} onChange={handleChange} />
                    </td>
                    <td>
                      <input name="form" value={formData.form} onChange={handleChange} />
                    </td>
                    <td>
                      <input name="parentPhone" value={formData.parentPhone} onChange={handleChange} />
                    </td>
                    <td>
                      <button className="save-btn" onClick={handleUpdate}>Save</button>
                      <button className="cancel-btn" onClick={() => setEditingStudent(null)}>Cancel</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={student._id}>
                    <td>{student.admissionNumber}</td>
                    <td>{student.name}</td>
                    <td>{student.stream}</td>
                    <td>{student.form}</td>
                    <td>{student.parentPhone}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(student)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(student._id)}>Delete</button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`page-btn ${currentPage === i + 1 ? "active-page" : ""}`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudentList;
