// src/api/resultsApi.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/results",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const generateResults = () =>
  API.post("/generate", { studentsHaveChosenSubjects: false });

export const exportResults = () =>
  API.post("/export", { studentsHaveChosenSubjects: false }, { responseType: "blob" });

export const downloadClassResults = (className, stream) =>
  API.get("/download-class", {
    params: {
      className,
      stream,
      studentsHaveChosenSubjects: false,
    },
    responseType: "blob",
  });

export const sendResultsSMS = () =>
  API.post("/send-sms", { studentsHaveChosenSubjects: false });
