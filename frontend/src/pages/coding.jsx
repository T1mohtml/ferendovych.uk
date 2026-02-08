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
        <h1 style={styles.title}>Coding Stats</h1>
        
        <div style={styles.statsContainer}>
          <motion.img 
            whileHover={{ scale: 1.02 }}
            src={`https://github-readme-stats-sigma-five.vercel.app/api?username=${GITHUB_USERNAME}&show_icons=true&theme=${theme}&hide_border=true&bg_color=00000000`}
            alt="GitHub Stats"
            style={styles.statImage}
          />
          
          <motion.img 
            whileHover={{ scale: 1.02 }}
            src={`https://github-readme-stats-sigma-five.vercel.app/api/top-langs/?username=${GITHUB_USERNAME}&layout=compact&theme=${theme}&hide_border=true&bg_color=00000000`}
            alt="Top Languages"
            style={styles.statImage}
          />
        </div>

        <div style={styles.streakContainer}>
           <motion.img 
            whileHover={{ scale: 1.02 }}
            src={`https://github-readme-streak-stats.herokuapp.com/?user=${GITHUB_USERNAME}&theme=${theme}&hide_border=true&background=00000000`}
            alt="GitHub Streak"
            style={styles.fullWidthImage}
          />
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
  statImage: {
    height: "180px",
    width: "auto",
    borderRadius: "10px",
  },
  fullWidthImage: {
    maxWidth: "100%",
    height: "auto",
    borderRadius: "10px",
  }
};