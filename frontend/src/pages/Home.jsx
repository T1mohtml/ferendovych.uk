import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import profileImage from "../assets/me.jpeg";
import NameForm from "../components/NameForm";

function SkidBanner() {
  const [showShame, setShowShame] = useState(false);
  const [caseId, setCaseId] = useState("");

  useEffect(() => {
    // 1. Check if the middleware tagged them
    if (document.cookie.includes('visitor_type=skid')) {
      setShowShame(true);
      
      // 2. Generate a professional looking random Case ID
      const year = new Date().getFullYear();
      const randomHex = Math.floor(Math.random() * 0xffffffff).toString(16).toUpperCase();
      setCaseId(`CF-${year}-${randomHex}`);
    }
  }, []);

  if (!showShame) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      background: 'linear-gradient(90deg, #ff0000, #000000)', // Added black for a "Security" look
      color: 'white',
      zIndex: 10000,
      padding: '20px',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '20px',
      borderBottom: '5px solid yellow',
      boxShadow: '0 5px 30px rgba(255,0,0,0.5)',
      fontFamily: 'monospace' // Monospace looks more like a "system"
    }}>
      <div style={{ marginBottom: '10px' }}>🤡 SKID DETECTED 🤡</div>
      <span style={{ fontSize: '15px', display: 'block', lineHeight: '1.5' }}>
        Found you using FFuF. Stop trying to look like a hacker in front of your crush, you're embarrassing yourself.<br/>
        We have logged your IPv4 address, and it WILL be shared with the appropriate authorities if you continue this behavior. <br/>
        Consider this your only warning.
      </span>
      
      <div style={{ 
        marginTop: '15px', 
        padding: '10px', 
        background: 'rgba(0,0,0,0.6)', 
        border: '1px solid #555',
        fontSize: '13px',
        display: 'inline-block'
      }}>
        <strong>Case id:</strong> {caseId} | <strong>CLEARANCE:</strong> Cleared for sharing with authorities | <strong>ACTION:</strong> Only warning for now, but will escalate if behavior continues.
      </div>
    </div>
  );
}

export default function Home() {
  // Set dynamic page title and force scroll to top
  useEffect(() => {
    document.title = "Home - My Page";
    // Force scroll to absolute top of page
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <>
      <SkidBanner />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 1.2, 
          ease: [0.6, -0.05, 0.01, 0.99]
        }}
        style={styles.heroSection}
      >
        <div style={styles.textWrapper}>
          <motion.h1 
            style={styles.heading}
            initial={{ opacity: 0, y: 30, scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.3,
              ease: "easeOut"
            }}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.15 }
            }}
          >
            Hey! I'm Timo 👋
          </motion.h1>
          <motion.p 
            style={styles.text}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.6,
              ease: "easeOut"
            }}
          >
            Welcome to my personal website.
          </motion.p>

          <motion.button
            style={styles.guestbookButton}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.8,
              ease: "easeOut"
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const guestbookSection = document.getElementById('guestbook');
              if (guestbookSection) {
                guestbookSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Sign My GuestBook 📖
          </motion.button>
          
          <motion.div
            style={styles.scrollIndicator}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 1.0,
              ease: "easeOut"
            }}
            onClick={() => {
              const aboutSection = document.querySelector('[data-section="about"]');
              if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={styles.scrollArrow}
            >
              ⬇️
            </motion.div>
            <p style={styles.scrollText}>Scroll to learn more</p>
          </motion.div>
        </div>
      </motion.div>

      <motion.section
        data-section="about"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1 }}
        style={styles.aboutSection}
      >
        <div style={styles.aboutContainer}>
          <motion.div
            style={styles.imageContainer}
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div style={styles.imageWrapper}>
              <img src={profileImage} alt="Timo" style={styles.profileImage} />
            </div>
          </motion.div>

          <div style={styles.aboutContent}>
            <h2 style={styles.aboutHeading}>About Me</h2>
            <p style={styles.aboutText}>
              Hi! I'm Timo, a web developer based in Denmark. I'm 11 years old and love coding.
            </p>
            <div style={styles.skillsContainer}>
              {['React', 'JavaScript', 'CSS'].map((skill) => (
                <span key={skill} style={styles.skillBadge}>{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <section id="guestbook" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <NameForm />
      </section>
    </>
  );
}

// Keep your existing styles object below...
const styles = {
  heroSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    width: "100%",
    textAlign: "center",
    padding: "80px 0 0 0",
    margin: "0",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  textWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  guestbookButton: {
    padding: "0.8rem 1.6rem",
    backgroundColor: "#646cff",
    color: "white",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    marginTop: "1.5rem",
    marginBottom: "1rem",
    boxShadow: "0 4px 15px rgba(100, 108, 255, 0.4)",
    zIndex: 10,
  },
  heading: {
    fontSize: "clamp(1.5rem, 6vw, 3rem)",
    margin: "0 0 1rem 0",
  },
  text: {
    fontSize: "clamp(1rem, 3vw, 1.5rem)",
    margin: "0",
  },
  aboutSection: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem 2rem",
    margin: "0",
    backgroundColor: "inherit",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  aboutContainer: {
    maxWidth: "1200px",
    display: "flex",
    alignItems: "center",
    gap: "4rem",
    flexWrap: "wrap",
  },
  aboutHeading: {
    fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
    marginBottom: "2rem",
    color: "inherit",
  },
  aboutText: {
    fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
    lineHeight: "1.6",
    marginBottom: "1.5rem",
    color: "inherit",
    opacity: 0.8,
    textAlign: "left",
  },
  skillsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    justifyContent: "center",
    marginTop: "2rem",
  },
  skillBadge: {
    padding: "0.5rem 1rem",
    backgroundColor: "#646cff",
    color: "white",
    borderRadius: "25px",
    fontSize: "0.9rem",
    fontWeight: "500",
    cursor: "pointer",
    display: "inline-block",
    boxShadow: "0 4px 15px rgba(100, 108, 255, 0.3)",
    border: "1px solid rgba(100, 108, 255, 0.2)",
  },
  imageContainer: {
    flex: "0 0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    minWidth: "250px",
  },
  aboutContent: {
    flex: "1 1 auto",
    textAlign: "left",
    minWidth: "300px",
  },
  imageWrapper: {
    position: "relative",
    display: "inline-block",
  },
  profileImage: {
    width: "clamp(180px, 20vw, 250px)",
    height: "clamp(180px, 20vw, 250px)",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #646cff",
    boxShadow: "0 20px 40px rgba(100, 108, 255, 0.2)",
  },
  scrollIndicator: {
    position: "relative",
    marginTop: "2rem",
    textAlign: "center",
    cursor: "pointer",
    zIndex: 3,
  },
  scrollArrow: {
    fontSize: "2rem",
    marginBottom: "0.5rem",
    display: "block",
  },
  scrollText: {
    fontSize: "0.9rem",
    opacity: 0.7,
    margin: "0",
    color: "inherit",
  },
};