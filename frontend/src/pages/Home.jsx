import React, { useEffect } from "react";
import { motion } from "framer-motion";
import profileImage from "../assets/me.jpeg";

export default function Home() {
  // Remove scroll disable - page is now scrollable

  // Set dynamic page title
  useEffect(() => {
    document.title = "Home - My Page";
  }, []);

  return (
    <>
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.3,
              ease: "easeOut"
            }}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
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
          
          {/* Floating animation elements */}
          <motion.div
            style={styles.floatingElement1}
            animate={{
              y: [-10, 10, -10],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            style={styles.floatingElement2}
            animate={{
              y: [10, -10, 10],
              rotate: [0, -3, 3, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1 }}
        style={styles.aboutSection}
      >
        <div style={styles.aboutContainer}>
          {/* Image Section */}
          <motion.div
            style={styles.imageContainer}
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              style={styles.imageWrapper}
              whileHover={{ 
                scale: 1.05,
                rotate: 2,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.img
                src={profileImage}
                alt="Timo - Web Developer"
                style={styles.profileImage}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              />
              
              {/* Decorative elements around the image */}
              <motion.div
                style={styles.imageDecor1}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.div
                style={styles.imageDecor2}
                animate={{
                  rotate: [360, 0],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </motion.div>
          </motion.div>

          {/* Text Content */}
          <motion.div 
            style={styles.aboutContent}
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.h2 
              style={styles.aboutHeading}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: 0.6,
                ease: "easeOut" 
              }}
              whileHover={{ 
                scale: 1.05,
                color: "#646cff", // Use the same accent color as skill badges
                transition: { duration: 0.3 }
              }}
            >
              About Me
            </motion.h2>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.p 
              style={styles.aboutText}
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
              whileHover={{ 
                x: 10,
                transition: { duration: 0.2 }
              }}
            >
              I'm a passionate developer who loves creating beautiful and functional web experiences. 
              With a focus on modern technologies and user-centered design, I enjoy bringing ideas to life 
              through code.
            </motion.p>
            <motion.p 
              style={styles.aboutText}
              initial={{ x: 30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.9 }}
              whileHover={{ 
                x: -10,
                transition: { duration: 0.2 }
              }}
            >
              When I'm not coding, you can find me exploring new technologies, reading about web development 
              trends, or working on personal projects that challenge me to grow as a developer.
            </motion.p>
          </motion.div>

          {/* Animated skill badges */}
          <motion.div 
            style={styles.skillsContainer}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            {['React', 'JavaScript', 'CSS'].map((skill, index) => (
              <motion.span
                key={skill}
                style={styles.skillBadge}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.4, 
                  delay: 1.3 + index * 0.1,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ 
                  scale: 1.1,
                  y: -5,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                {skill}
              </motion.span>
            ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </>
  );
}

const styles = {
  heroSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    width: "100%",
    textAlign: "center",
    padding: "80px 0 0 0", // Add top padding for navbar
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
    backgroundColor: "inherit", // Inherit the body's background color
    boxSizing: "border-box",
    overflow: "hidden",
  },
  aboutContainer: {
    maxWidth: "1200px",
    display: "flex",
    alignItems: "center",
    gap: "4rem",
    flexWrap: "wrap",
    "@media (max-width: 768px)": {
      flexDirection: "column",
      textAlign: "center",
      gap: "2rem",
    },
  },
  aboutHeading: {
    fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
    marginBottom: "2rem",
    color: "inherit", // Inherit the body's text color
  },
  aboutText: {
    fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
    lineHeight: "1.6",
    marginBottom: "1.5rem",
    color: "inherit", // Inherit the body's text color
    opacity: 0.8, // Slightly dimmed for secondary text effect
    textAlign: "left",
  },
  floatingElement1: {
    position: "absolute",
    top: "20%",
    left: "10%",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(45deg, #ff6b6b, #4ecdc4)",
    opacity: 0.1,
    zIndex: -1,
  },
  floatingElement2: {
    position: "absolute",
    bottom: "20%",
    right: "15%",
    width: "80px",
    height: "80px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    opacity: 0.08,
    zIndex: -1,
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
    backgroundColor: "#646cff", // Use a color that works in both themes
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
    cursor: "pointer",
  },
  profileImage: {
    width: "clamp(180px, 20vw, 250px)",
    height: "clamp(180px, 20vw, 250px)",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #646cff",
    boxShadow: "0 20px 40px rgba(100, 108, 255, 0.2)",
    position: "relative",
    zIndex: 2,
  },
  imageDecor1: {
    position: "absolute",
    top: "-20px",
    right: "-20px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(45deg, #ff6b6b, #4ecdc4)",
    opacity: 0.2,
    zIndex: 1,
  },
  imageDecor2: {
    position: "absolute",
    bottom: "-15px",
    left: "-25px",
    width: "40px",
    height: "40px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    opacity: 0.3,
    zIndex: 1,
  },
};
