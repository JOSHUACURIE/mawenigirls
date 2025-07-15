import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: localStorage.getItem("rememberedEmail") || "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(
    !!localStorage.getItem("rememberedEmail")
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(form.email, form.password);

      if (!res.success) {
        toast.error(res.message || "Login failed.");
        setLoading(false);
      } else {
        toast.success("✅ Login successful!");
        if (remember) {
          localStorage.setItem("rememberedEmail", form.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }
      }
    } catch (err) {
      toast.error("❌ Something went wrong. Please try again.");
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const role = user.role || (Array.isArray(user.roles) ? user.roles[0] : null);
      if (!role) {
        toast.error("❌ No role assigned. Contact admin.");
        return;
      }
      navigate(`/${role.toLowerCase()}`);
    }
  }, [user, navigate]);

  return (
    <div className="login-container">
      <h2 className="login-heading">🔐 Login</h2>

      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="login-input"
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="login-input"
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈 Hide" : "👁️ Show"}
          </span>
        </div>

        <div className="login-links">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            Remember me
          </label>
          <a href="/forgot-password" className="forgot-password-link">
            Forgot password?
          </a>
        </div>

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <ToastContainer />
    </div>
  );
};

export default LoginPage;
