// src/components/StudentPerformanceChart.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#8884d8"];

const StudentPerformanceChart = () => {
  const [subjectAverages, setSubjectAverages] = useState([]);
  const [gradeDistribution, setGradeDistribution] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await axios.post("http://localhost:5000/api/results/generate", {
          schoolId: "your-school-id", // replace if needed
          studentsHaveChosenSubjects: false
        });

        // Process for subject average
        const subjectMap = {};
        const gradeMap = {};

        data.forEach((student) => {
          student.scores.forEach(({ subject, marks, grade }) => {
            // Average marks
            if (!subjectMap[subject]) subjectMap[subject] = { total: 0, count: 0 };
            subjectMap[subject].total += marks;
            subjectMap[subject].count += 1;

            // Grade distribution
            gradeMap[grade] = (gradeMap[grade] || 0) + 1;
          });
        });

        const averages = Object.entries(subjectMap).map(([subject, { total, count }]) => ({
          subject,
          average: (total / count).toFixed(1)
        }));

        const gradeData = Object.entries(gradeMap).map(([grade, count]) => ({
          name: grade,
          value: count
        }));

        setSubjectAverages(averages);
        setGradeDistribution(gradeData);
      } catch (err) {
        console.error("Failed to fetch results", err);
      }
    };

    fetchResults();
  }, []);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
      <div style={{ width: "100%", maxWidth: "600px" }}>
        <h3>Average Scores Per Subject</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={subjectAverages}>
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="average" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ width: "100%", maxWidth: "400px" }}>
        <h3>Grade Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={gradeDistribution}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {gradeDistribution.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudentPerformanceChart;
