import ExcelJS from "exceljs";

export const generateExcel = async (results) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Results");

  // Get subject list from the first student's scores
  const subjectList = results.length > 0 
    ? results[0].scores.map(score => score.subject) 
    : [];

  // Define Columns
  const baseColumns = [
    { header: "Adm No", key: "admissionNumber", width: 15 },
    { header: "Student Name", key: "studentName", width: 25 },
    { header: "Stream", key: "stream", width: 15 },
  ];

  const subjectColumns = subjectList.map((subject) => ({
    header: subject,
    key: subject,
    width: 15,
  }));

  const finalColumns = [
    { header: "Total", key: "total", width: 10 },
    { header: "Grade", key: "grade", width: 10 },
  ];

  worksheet.columns = [...baseColumns, ...subjectColumns, ...finalColumns];

  // Add student rows
  results.forEach((result) => {
    const rowData = {
      admissionNumber: result.student.admissionNumber,
      studentName: result.student.name,
      stream: result.student.stream || "-",
      total: result.totalMarks,
      grade: result.grade,
    };

    result.scores.forEach((score) => {
      const gradeValue = Array.isArray(score.grade) ? score.grade[0] : score.grade;
      rowData[score.subject] = `${score.marks} (${gradeValue})`;
    });

    worksheet.addRow(rowData);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};
