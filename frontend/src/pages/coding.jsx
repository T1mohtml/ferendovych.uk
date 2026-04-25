import React from "react";
import { motion } from "framer-motion";

const GITHUB_USERNAME = "T1moHTML"; // TODO: Replace with your GitHub username

export default function Coding({ darkMode }) {
  const theme = darkMode ? "radical" : "default";
  
  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={styles.content}
      >
        <h1 style={styles.title}>
          <span style={styles.titleGradient}>Coding Stats</span>
        </h1>
        
        <div style={styles.statsContainer}>
          <motion.div style={styles.imageCard} whileHover={{ scale: 1.02, y: -4 }}>
            <img
              src={`https://github-readme-stats-sigma-five.vercel.app/api?username=${GITHUB_USERNAME}&show_icons=true&theme=${theme}&hide_border=true&bg_color=00000000`}
              alt="GitHub Stats"
              style={styles.statImage}
            />
          </motion.div>
          
          <motion.div style={styles.imageCard} whileHover={{ scale: 1.02, y: -4 }}>
            <img
              src={`https://github-readme-stats-sigma-five.vercel.app/api/top-langs/?username=${GITHUB_USERNAME}&layout=compact&theme=${theme}&hide_border=true&bg_color=00000000`}
              alt="Top Languages"
              style={styles.statImage}
            />
          </motion.div>
        </div>

        <div style={styles.streakContainer}>
          <motion.div style={{ ...styles.imageCard, width: '100%' }} whileHover={{ scale: 1.01, y: -3 }}>
            <img
              src={`https://github-readme-streak-stats.herokuapp.com/?user=${GITHUB_USERNAME}&theme=${theme}&hide_border=true&background=00000000`}
              alt="GitHub Streak"
              style={styles.fullWidthImage}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "100px 20px 40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  content: {
    maxWidth: "800px",
    width: "100%",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "2rem",
    textAlign: "center",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  titleGradient: {
    background: "linear-gradient(135deg, #c4b5fd 0%, #818cf8 50%, #a5f3fc 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  statsContainer: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "20px",
  },
  streakContainer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },
  imageCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(124,58,237,0.18)",
    borderRadius: "14px",
    padding: "12px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "box-shadow 0.2s",
  },
  statImage: {
    height: "180px",
    width: "auto",
    borderRadius: "6px",
    display: "block",
  },
  fullWidthImage: {
    maxWidth: "100%",
    height: "auto",
    borderRadius: "6px",
    display: "block",
  }
};