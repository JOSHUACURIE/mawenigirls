import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./LoginPage.css"; // Reuse login styles
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });

      if (res.data.success) {
        toast.success("✅ Reset instructions sent to your email.");
      } else {
        toast.error(res.data.message || "Something went wrong.");
      }
    } catch (err) {
      toast.error("❌ Could not process request. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-heading">🔁 Forgot Password</h2>

      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          className="login-input"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p style={{ marginTop: "15px", fontSize: "14px" }}>
        Remembered your password? <Link><a href="/login">Login</a></Link>
      </p>

      <ToastContainer />
    </div>
  );
};

export default ForgotPasswordPage;
