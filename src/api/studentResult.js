import api from '../services/api'

// 🔁 Generate and save analyzed results to StudentResult


// 🎯 Get result by admission number
export const getResultByAdmission = (admissionNumber) =>
  api.get(`/api/results/student-adm/${admissionNumber}`);

// 📥 Download individual result (Excel or PDF)
export const generateStudentResults = (className) =>
  api.post("/api/results", { className }); // Stream removed

export const downloadIndividualResult = async (admissionNumber) => {
  const res = await api.get(`/api/results/student/${admissionNumber}/download`, {
    responseType: "blob",
  });
  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Student_Result_${admissionNumber}.xlsx`;
  link.click();
};


// 📚 Get results for a specific class and stream
export const getClassResults = (className, stream) =>
  api.get("/api/results/class-results", {
    params: { class: className, stream }
  });
