// // utils/analyzeStudentResults.js

// import gradingConfig from "./gradingConfig";

// // Helper: Convert grade to KCSE-style point system
// const gradeToPoints = (grade) => {
//   const pointsMap = {
//     A: 12,
//     "A-": 11,
//     "B+": 10,
//     B: 9,
//     "B-": 8,
//     "C+": 7,
//     C: 6,
//     "C-": 5,
//     "D+": 4,
//     D: 3,
//     "D-": 2,
//     E: 1,
//   };
//   return pointsMap[grade] || 0;
// };

// export const analyzeStudentResults = (students, subjects) => {
//   return students.map((student) => {
//     let totalMarks = 0;
//     let totalPoints = 0;
//     const subjectGrades = {};

//     subjects.forEach((subject) => {
//       const marks = student.scores[subject] ?? 0;

//       // Assign subject grade
//       const grade =
//         Object.entries(gradingConfig.subjectMarksThresholds)
//           .find(([g, threshold]) => marks >= threshold)?.[0] || "E";

//       subjectGrades[subject] = grade;
//       totalMarks += marks;
//       totalPoints += gradeToPoints(grade);
//     });

//     // Compute overall grade
//     let overallGrade = "E";
//     if (gradingConfig.gradingMethod === "points") {
//       overallGrade =
//         Object.entries(gradingConfig.pointsTotalThresholds)
//           .find(([g, threshold]) => totalPoints >= threshold)?.[0] || "E";
//     } else {
//       overallGrade =
//         Object.entries(gradingConfig.totalMarksThresholds)
//           .find(([g, threshold]) => totalMarks >= threshold)?.[0] || "E";
//     }

//     return {
//       ...student,
//       subjectGrades,
//       totalMarks,
//       totalPoints,
//       overallGrade,
//     };
//   });
// };
