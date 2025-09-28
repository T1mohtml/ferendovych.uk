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

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={styles.container}
    >
      <h1 style={styles.heading}>Hey! I'm Timo 👋</h1>
      <p style={styles.text}>Welcome to my personal website.</p>
    </motion.div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100vw",
    textAlign: "center",
    padding: "2vw",
  },
  heading: { fontSize: "4vw", marginBottom: "1rem" },
  text: { fontSize: "2vw" },
};
