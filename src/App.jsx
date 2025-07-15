import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DOSDashboard from "./roles/dosdashboard";
import TeacherDashboard from './roles/teacherdashboard';
import PrincipalDashboard from './roles/PrincipalDashboard';
import SubjectManagement from './components/subjectmanagement'; // ✅ Make sure this path is correct
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/Resetpassword";

// ProtectedRoute wrapper
const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useContext(AuthContext);

  if (!isAuthenticated) return <Navigate to="/" />;
  if (role && user?.role !== role) return <Navigate to="/" />;

  return children;
};

const App = () => {
  return (
    <Router>
     
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* DOS Routes */}
        <Route
          path="/dos"
          element={
            <ProtectedRoute role="DOS">
              <DOSDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dos/subjects"
          element={
            <ProtectedRoute role="DOS">
              <SubjectManagement />
            </ProtectedRoute>
          }
        />

        {/* Teacher Route */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute role="Teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Principal Route */}
        <Route
          path="/principal"
          element={
            <ProtectedRoute role="Principal">
              <PrincipalDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
