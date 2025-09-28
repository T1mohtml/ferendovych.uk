import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "#1a1a1a" : "#f0f0f0";
    document.body.style.color = darkMode ? "#f0f0f0" : "#1a1a1a";
  }, [darkMode]);

  return (
    <div style={styles.toggleWrapper} onClick={toggleMode}>
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        style={{
          ...styles.toggleCircle,
          marginLeft: darkMode ? "32px" : "2px",
          backgroundColor: darkMode ? "#1a1a1a" : "#f0f0f0",
        }}
      >
        <span style={styles.icon}>{darkMode ? "🌙" : "☀️"}</span>
      </motion.div>
    </div>
  );
}

const styles = {
  toggleWrapper: {
    position: "fixed",
    top: "20px",
    left: "20px",
    width: "60px",
    height: "30px",
    borderRadius: "30px",
    backgroundColor: "#888",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "2px",
    zIndex: 10,
  },
  toggleCircle: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: { fontSize: "0.8rem" },
};
