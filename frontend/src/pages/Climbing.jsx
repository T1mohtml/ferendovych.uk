import React, { useEffect } from "react";
import { motion } from "framer-motion";

export default function Climbing() {
  // Set dynamic page title
  useEffect(() => {
    document.title = "Climbing Adventures - Timo";
  }, []);

  return (
    <>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 1.0, 
          ease: [0.6, -0.05, 0.01, 0.99]
        }}
        style={styles.heroSection}
      >
        <div style={styles.heroContent}>
          <motion.h1 
            style={styles.heroTitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.2,
              ease: "easeOut"
            }}
          >
            🧗‍♂️ Climbing Adventures
          </motion.h1>
          <motion.p 
            style={styles.heroText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.5,
              ease: "easeOut"
            }}
          >
            Exploring vertical worlds, one route at a time
          </motion.p>
        </div>
      </motion.div>

      {/* Adventures Gallery Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1 }}
        style={styles.adventuresSection}
      >
        <div style={styles.container}>
          <motion.h2 
            style={styles.sectionTitle}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Recent Adventures
          </motion.h2>

          <div style={styles.adventuresGrid}>
            {climbingAdventures.map((adventure, index) => (
              <motion.div
                key={adventure.id}
                style={styles.adventureCard}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1 + 0.3,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                  transition: { duration: 0.5 }
                }}
              >
                <div style={styles.adventureContent}>
                  <div style={styles.adventureHeader}>
                    <h3 style={styles.adventureTitle}>{adventure.title}</h3>
                    <div style={styles.adventureGrade}>{adventure.grade}</div>
                  </div>
                  <p style={styles.adventureLocation}>📍 {adventure.location}</p>
                  <p style={styles.adventureDescription}>{adventure.description}</p>
                  
                  <div style={styles.adventureMeta}>
                    <span style={styles.adventureDate}>{adventure.date}</span>
                    <span style={styles.adventureType}>{adventure.type}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1 }}
        style={styles.statsSection}
      >
        <div style={styles.container}>
          <motion.h2 
            style={styles.sectionTitle}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Climbing Stats
          </motion.h2>

          <div style={styles.statsGrid}>
            {climbingStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                style={styles.statCard}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1 + 0.3,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.1 }
                }}
              >
                <div style={styles.statIcon}>{stat.icon}</div>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </>
  );
}

// Sample climbing adventures data
const climbingAdventures = [
  {
    id: 1,
    title: "Næstved Klatre Klub (NKL) boulder",
    location: "Næstved, Sjælland, Denmark",
    grade: "5A (boulder scale)",
    type: "Bouldering",
    date: "Sep 2025",
    description: "Finally got to to the top before it started to be a leading route. It was also my first route before i found some of the easier ones."
  },
  {
    id: 2,
    title: "Næstved Klatre Klub (NKL) lead",
    location: "Næstved, Sjælland, Denmark",
    grade: "4a (lead scale)",
    type: "Lead Climbing",
    date: "Sep 2025",
    description: "Finally got permission to lead climb at NKL. Felt great to clip the quickdraws and manage the rope. hit my head twice when the rope came down! overall a great experience."
  },
  {
    id: 3,
    title: "Næstved Klatre Klub (NKL) Lead",
    location: "Næstved, Sjælland, Denmark",
    grade: "4b (lead scale)",
    type: "Lead Climbing",
    date: "Sep 2025",
    description: "Tried leading a slightly harder route this time. Fell a couple of times but managed to top it out and get to the top."
  }
];

// Climbing statistics
const climbingStats = [
  { icon: "🎯", value: "15+", label: "Routes Climbed" },
  { icon: "⛰️", value: "1", label: "Locations Visited" },
  { icon: "📈", value: "6b", label: "Hardest Grade" },
];

const styles = {
  heroSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100%",
    textAlign: "center",
    padding: "0 2rem 2rem 2rem",
    paddingTop: "80px", // Space for fixed navbar
    margin: "0",
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(135deg, rgba(100, 108, 255, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%)",
    boxSizing: "border-box",
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
  },
  heroTitle: {
    fontSize: "clamp(2rem, 8vw, 4rem)",
    margin: "0 0 1rem 0",
    fontWeight: "700",
    background: "linear-gradient(135deg, #646cff, #ff6b6b)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroText: {
    fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
    margin: "0",
    opacity: 0.8,
  },
  adventuresSection: {
    minHeight: "100vh",
    width: "100%",
    padding: "4rem 2rem",
    margin: "0",
    backgroundColor: "inherit",
    boxSizing: "border-box",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: "clamp(2rem, 6vw, 3rem)",
    textAlign: "center",
    marginBottom: "3rem",
    color: "inherit",
  },
  adventuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "2rem",
    marginBottom: "4rem",
  },
  adventureCard: {
    backgroundColor: "rgba(100, 108, 255, 0.05)",
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid rgba(100, 108, 255, 0.1)",
    cursor: "pointer",
    transition: "all 0.1s ease",
  },
  adventureGrade: {
    backgroundColor: "#646cff",
    color: "white",
    padding: "0.4rem 1rem",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
    whiteSpace: "nowrap",
    marginLeft: "1rem",
  },
  adventureContent: {
    padding: "2rem",
  },
  adventureHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  adventureTitle: {
    fontSize: "1.3rem",
    fontWeight: "600",
    margin: "0",
    color: "inherit",
    flex: "1",
  },
  adventureLocation: {
    fontSize: "0.9rem",
    color: "inherit",
    opacity: 0.7,
    marginBottom: "1rem",
  },
  adventureDescription: {
    fontSize: "0.95rem",
    lineHeight: "1.5",
    color: "inherit",
    opacity: 0.8,
    marginBottom: "1rem",
  },
  adventureMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  adventureDate: {
    fontSize: "0.85rem",
    color: "inherit",
    opacity: 0.6,
  },
  adventureType: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    color: "#ff6b6b",
    padding: "0.2rem 0.6rem",
    borderRadius: "10px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  statsSection: {
    minHeight: "50vh",
    width: "100%",
    padding: "4rem 2rem",
    margin: "0",
    backgroundColor: "inherit",
    boxSizing: "border-box",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "2rem",
  },
  statCard: {
    textAlign: "center",
    padding: "2rem 1rem",
    borderRadius: "15px",
    backgroundColor: "rgba(100, 108, 255, 0.05)",
    border: "1px solid rgba(100, 108, 255, 0.1)",
    cursor: "pointer",
  },
  statIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#646cff",
    marginBottom: "0.5rem",
  },
  statLabel: {
    fontSize: "1rem",
    color: "inherit",
    opacity: 0.7,
  },
};