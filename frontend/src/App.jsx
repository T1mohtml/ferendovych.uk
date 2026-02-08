import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Climbing from "./pages/Climbing.jsx";
import Admin from "./pages/Admin.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import Navigation from "./components/Navigation.jsx";
import Coding from "./pages/coding.jsx";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "#1a1a1a" : "#f0f0f0";
    document.body.style.color = darkMode ? "#f0f0f0" : "#1a1a1a";
  }, [darkMode]);

  const toggleMode = () => setDarkMode(!darkMode);

  return (
    <Router>
      <Navigation />
      <ThemeToggle darkMode={darkMode} toggleMode={toggleMode} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/climbing" element={<Climbing />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/coding" element={<Coding darkMode={darkMode} />} />
      </Routes>
    </Router>
  );
}

export default App;