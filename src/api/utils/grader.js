// // utils/grader.js
// import gradingConfig from "./gradingConfig";

// export const analyzeStudentResults = (rawScores) => {
//   const studentsMap = new Map();
//   const allSubjects = new Set();

//   // Organize scores per student
//   rawScores.forEach(({ student, subject, score }) => {
//     const id = student._id;
//     if (!studentsMap.has(id)) {
//       studentsMap.set(id, {
//         student,
//         scores: [],
//         totalMarks: 0,
//         totalPoints: 0
//       });
//     }

//     const grade = getGrade(score, gradingConfig.subjectMarksThresholds);
//     const points = getPoints(grade); // Convert grade to KCSE points

//     studentsMap.get(id).scores.push({
//       subject: subject.name,
//       marks: score,
//       grade,
//       points
//     });

//     studentsMap.get(id).totalMarks += score;
//     studentsMap.get(id).totalPoints += points;
//     allSubjects.add(subject.name);
//   });

//   const results = Array.from(studentsMap.values());

//   // Add grades
//   results.forEach((res) => {
//     res.grade = getGrade(
//       gradingConfig.gradingMethod === "points"
//         ? res.totalPoints
//         : res.totalMarks,
//       gradingConfig.gradingMethod === "points"
//         ? gradingConfig.pointsTotalThresholds
//         : gradingConfig.totalMarksThresholds
//     );
//   });

//   return { results, subjects: Array.from(allSubjects) };
// };

// const getGrade = (value, thresholds) => {
//   for (const [grade, min] of Object.entries(thresholds)) {
//     if (value >= min) return grade;
//   }
//   return "E";
// };

// const getPoints = (grade) => {
//   const pointMap = {
//     A: 12, "A-": 11,
//     "B+": 10, B: 9, "B-": 8,
//     "C+": 7, C: 6, "C-": 5,
//     "D+": 4, D: 3, "D-": 2,
//     E: 1
//   };
//   return pointMap[grade] || 0;
// };
