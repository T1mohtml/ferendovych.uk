import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import "./Navigation.css";

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/climbing", label: "Climbing", icon: "🧗‍♂️" },
    { path: "/coding", label: "Coding", icon: "💻" }
  ];

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="nav-container">
        <motion.div
          className="nav-logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/" className="nav-logo-link">
            Timo
          </Link>
        </motion.div>

        <div className="nav-links">
          {navItems.map((item) => (
            <motion.div
              key={item.path}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}