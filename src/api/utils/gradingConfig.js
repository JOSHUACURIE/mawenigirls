// utils/gradingConfig.js

const gradingConfig = {
  gradingMethod: "points", // or "totalMarks" — admin can switch

  // Thresholds for grading individual subject marks (0–100 scale assumed)
  subjectMarksThresholds: {
    A: 80,
    "A-": 75,
    "B+": 70,
    B: 65,
    "B-": 60,
    "C+": 55,
    C: 50,
    "C-": 45,
    "D+": 40,
    D: 35,
    "D-": 30,
  },

  
  totalMarksThresholds: {
    A: 880,    // 80% of 1100
    "A-": 825, // 75% of 1100
    "B+": 770, // 70%
    B: 715,    // 65%
    "B-": 660, // 60%
    "C+": 605, // 55%
    C: 550,    // 50%
    "C-": 495, // 45%
    "D+": 440, // 40%
    D: 385,    // 35%
    "D-": 330, // 30%
  },

  // Thresholds for grading total points (sum of 8 subjects, max 84)
  pointsTotalThresholds: {
    A: 81,    // 80% of 84
    "A-": 74,   // 75% of 84
    "B+": 67, // 70%
    B: 64,    // 65%
    "B-": 54, // 60%
    "C+": 46, // 55%
    C: 40,      // 50%
    "C-": 37, // 45%
    "D+": 33, // 40%
    D: 29,    // 35%
    "D-": 25, // 30%
  },
};

export default gradingConfig;
