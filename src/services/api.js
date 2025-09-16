import axios from "axios";

// ✅ Axios instance
const api = axios.create({
  baseURL: "https://mawen.onrender.com/api",
  withCredentials: true,
});

// ✅ Attach auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: global response error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

// ===================== SUBJECT API =====================
export const getSubjects = () => api.get("/subjects");
export const getSubjectById = (id) => api.get(`/subjects/${id}`);
export const addSubject = ({ name, form, teacherId }) =>
  api.post("/subjects", { name, form, teacherId });
export const updateSubject = (id, { name, form, teacherId }) =>
  api.put(`/subjects/${id}`, { name, form, teacherId });
export const deleteSubject = (id) => api.delete(`/subjects/${id}`);

// ✅ NEW: Get students assigned to a subject
export const getSubjectStudents = (subjectId) =>
  api.get(`/subjects/${subjectId}/students`);

// ===================== TEACHER API =====================
export const getTeachers = () => api.get("/teachers");
export const getAssignedSubjects = () => api.get("/teachers/me/subjects");

// ===================== STUDENT API =====================
export const addStudent = (data) => api.post("/students", data);
export const getStudents = () => api.get("/students");
export const getStudentById = (id) => api.get(`/students/${id}`);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);

// ===================== SCORE API =====================
export const getScores = (params = {}) => api.get("/scores", { params });
export const getScoreOptions = () => api.get("/scores/options");
export const submitScores = ({ teacherId, subjectId, scores }) =>
  api.post("/scores", { teacherId, subjectId, scores });
export const updateScore = (scoreId, data) => api.put(`/scores/${scoreId}`, data);

// ===================== RESULT API =====================
export const generateResults = ({ className, stream }) =>
  api.post("/results/generate", { class: className, stream });

export const exportResultsToExcel = ({ className, stream }) =>
  api.get("/results/export", {
    params: { class: className, stream },
    responseType: "blob",
  });

export const sendResultsSMS = ({ className, stream }) =>
  api.post("/results/send-sms", { class: className, stream });

// ===================== AUTH API =====================
export const login = (data) => api.post("/auth/login", data);
export const signup = (data) => api.post("/auth/signup", data);

export default api;
