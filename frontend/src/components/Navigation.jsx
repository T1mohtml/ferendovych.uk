import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/climbing", label: "Climbing", icon: "🧗‍♂️" }
  ];

  return (
    <motion.nav
      style={styles.navbar}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div style={styles.navContainer}>
        <motion.div
          style={styles.logo}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/" style={styles.logoLink}>
            Timo
          </Link>
        </motion.div>

        <div style={styles.navLinks}>
          {navItems.map((item) => (
            <motion.div
              key={item.path}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <Link
                to={item.path}
                style={{
                  ...styles.navLink,
                  ...(location.pathname === item.path ? styles.activeLink : {})
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                {item.label}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}

const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(100, 108, 255, 0.1)",
    padding: "1rem 0",
  },
  navContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 2rem",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "700",
  },
  logoLink: {
    textDecoration: "none",
    color: "#646cff",
  },
  navLinks: {
    display: "flex",
    gap: "2rem",
    alignItems: "center",
  },
  navLink: {
    textDecoration: "none",
    color: "inherit",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    borderRadius: "25px",
    transition: "all 0.3s ease",
    fontSize: "0.95rem",
    fontWeight: "500",
  },
  activeLink: {
    backgroundColor: "#646cff",
    color: "white",
  },
  navIcon: {
    fontSize: "1rem",
  },
};