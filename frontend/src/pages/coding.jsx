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

        <div style={styles.githubCta}>
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.githubButton}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 12px 36px rgba(124,58,237,0.55), inset 0 1px 0 rgba(255,255,255,0.18)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.12)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.6rem', flexShrink: 0 }}>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </div>
        
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
  },
  githubCta: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "2.5rem",
  },
  githubButton: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.7rem 1.8rem",
    background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 60%, #6366f1 100%)",
    color: "white",
    borderRadius: "50px",
    fontSize: "0.95rem",
    fontWeight: "700",
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 6px 24px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.12)",
    letterSpacing: "0.02em",
    transition: "box-shadow 0.2s, transform 0.2s",
    cursor: "pointer",
  },
};