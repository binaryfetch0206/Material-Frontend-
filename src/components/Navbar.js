import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Apply theme to body
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <nav className={`navbar ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <h2 className="logo">Material Discovery</h2>
      <div className="nav-right">
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/prediction">Prediction</Link></li>
          {/* <li><Link to="/materials">Material List</Link></li> */}
        </ul>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
