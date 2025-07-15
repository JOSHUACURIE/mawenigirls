import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./LoginPage.css";

const ResetPasswordPage = () => {
  const { token } = useParams(); // from the URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("❌ Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/reset-password", {
        token,
        newPassword: password,
      });

      if (res.data.success) {
        toast.success("✅ Password reset successful!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(res.data.message || "Reset failed.");
      }
    } catch (err) {
      toast.error("❌ Something went wrong.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-heading">🔒 Reset Password</h2>

      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="password"
          className="login-input"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="login-input"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <ToastContainer />
    </div>
  );
};

export default ResetPasswordPage;
