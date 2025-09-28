import React, { useEffect } from "react";
import { motion } from "framer-motion";

export default function Home() {
  // Disable scrolling while on this page
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Set dynamic page title
  useEffect(() => {
    document.title = "Home - My Page";
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={styles.container}
    >
      <div style={styles.textWrapper}>
        <h1 style={styles.heading}>Hey! I'm Timo 👋</h1>
        <p style={styles.text}>Welcome to my personal website.</p>
      </div>
      <p style={styles.footerText}>
        If the text looks off, reload the page.
      </p>
    </motion.div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column", // stack content vertically
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100vw",
    textAlign: "center",
    padding: "clamp(1rem, 4vw, 3rem)",
    position: "relative", // needed for footer absolute positioning
  },
  textWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: "clamp(1.5rem, 6vw, 3rem)",
    marginBottom: "1rem",
  },
  text: {
    fontSize: "clamp(1rem, 3vw, 1.5rem)",
  },
  footerText: {
    position: "absolute",
    bottom: "1rem",
    fontSize: "clamp(0.75rem, 1.5vw, 1rem)",
    color: "#555",
  },
};
