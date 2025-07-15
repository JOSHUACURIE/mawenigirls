import React from "react";
import "./Header.css";

const Header = ({ onToggleSidebar, onLogout, user }) => {
  return (
    <header className="app-header">
      <button className="hamburger" onClick={onToggleSidebar}>
        ☰
      </button>
      <div className="app-logo">📘 School Manager</div>

      <div className="header-right">
        {user && <span className="welcome-text">Welcome, {user.name || "User"}</span>}
        <button className="logout-btn" onClick={onLogout}>
          🔒 Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
