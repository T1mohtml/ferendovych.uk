import React from "react";
import { motion } from "framer-motion";

export default function ThemeToggle({ darkMode, toggleMode, topOffset = 20 }) {
  return (
    <div style={{ ...styles.toggleWrapper, top: `${topOffset}px` }} onClick={toggleMode}>
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        style={{
          ...styles.toggleCircle,
          marginLeft: darkMode ? "32px" : "2px",
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
    left: "20px",
    width: "62px",
    height: "32px",
    borderRadius: "32px",
    background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
    boxShadow: "0 2px 12px rgba(124,58,237,0.4)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "2px",
    zIndex: 10,
  },
  toggleCircle: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.92)",
    boxShadow: "0 1px 6px rgba(0,0,0,0.25)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: { fontSize: "0.8rem" },
};
