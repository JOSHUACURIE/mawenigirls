import axios from "axios";

// ✅ Create an Axios instance with corrected base URL
const api = axios.create({
  baseURL: "https://mawen.onrender.com/api", // ✅ Now includes /api
  withCredentials: true, // Optional, useful if using cookies or auth headers
});

// ✅ Request interceptor to attach auth token
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

// ⚠️ Optional: Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.message);
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
export const submitScores = (scores) => api.post("/scores", { scores });
export const updateScore = (id, data) => api.put(`/scores/${id}`, data);

// ===================== RESULT ANALYSIS API =====================
export const generateResults = (scores) =>
  api.post("/results/generate", { scores });
export const exportAllResults = (scores) =>
  api.post("/results/export", { scores }, { responseType: "blob" });
export const exportClassResults = (scores, className, stream) =>
  api.post(
    "/results/class-results",
    { scores, className, stream },
    { responseType: "blob" }
  );
export const sendResultsSMS = (scores, className, stream) =>
  api.post("/results/send-sms", { scores, className, stream });

// ===================== AUTH API =====================
export const login = (data) => api.post("/auth/login", data);
export const signup = (data) => api.post("/auth/signup", data);

export default api;
