import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Climbing from "./pages/Climbing.jsx";
import Admin from "./pages/Admin.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import Navigation from "./components/Navigation.jsx";
import Coding from "./pages/coding.jsx";

function AppShell({ darkMode, toggleMode }) {
  const location = useLocation();
  const [siteStatus, setSiteStatus] = useState({
    loaded: false,
    underConstructionEnabled: false,
    underConstructionTitle: 'Under Construction',
    underConstructionMessage: 'This website is currently under construction. Please check back soon.',
    announcementEnabled: false,
    announcementMessage: '',
    hideNavigationEnabled: false,
  });

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await fetch('/api/site-status');
        const data = await response.json();
        if (response.ok) {
          setSiteStatus((prev) => ({ ...prev, ...data, loaded: true }));
          return;
        }
      } catch {
        // ignore
      }

      setSiteStatus((prev) => ({ ...prev, loaded: true }));
    };

    loadStatus();
  }, []);

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (!siteStatus.loaded) {
    return null;
  }

  if (!isAdminRoute && siteStatus.underConstructionEnabled) {
    return (
      <div style={styles.bannedOverlay}>
        <div style={styles.bannedCard}>
          <h1 style={styles.bannedTitle}>{siteStatus.underConstructionTitle || 'Under Construction'}</h1>
          <p style={styles.bannedText}>{siteStatus.underConstructionMessage || 'This website is currently under construction. Please check back soon.'}</p>
          <p style={styles.bannedText}>Admin panel remains available.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isAdminRoute && siteStatus.announcementEnabled && siteStatus.announcementMessage && (
        <div style={styles.announcementBar}>{siteStatus.announcementMessage}</div>
      )}
      {!siteStatus.hideNavigationEnabled && <Navigation />}
      <ThemeToggle darkMode={darkMode} toggleMode={toggleMode} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/climbing" element={<Climbing />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/coding" element={<Coding darkMode={darkMode} />} />
      </Routes>
    </>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [banState, setBanState] = useState({ loading: true, banned: false, reason: '', expires_at: null });

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "#1a1a1a" : "#f0f0f0";
    document.body.style.color = darkMode ? "#f0f0f0" : "#1a1a1a";
  }, [darkMode]);

  useEffect(() => {
    const checkBan = async () => {
      try {
        const response = await fetch('/api/check-ban');
        const data = await response.json();

        if (!response.ok && response.status === 403 && data?.banned) {
          setBanState({
            loading: false,
            banned: true,
            reason: data.reason || 'You are banned from this website.',
            expires_at: data.expires_at || null,
          });
          return;
        }

        setBanState({ loading: false, banned: false, reason: '', expires_at: null });
      } catch {
        setBanState({ loading: false, banned: false, reason: '', expires_at: null });
      }
    };

    checkBan();
  }, []);

  const toggleMode = () => setDarkMode(!darkMode);

  if (banState.loading) {
    return null;
  }

  if (banState.banned) {
    return (
      <div style={styles.bannedOverlay}>
        <div style={styles.bannedCard}>
          <h1 style={styles.bannedTitle}>Access denied</h1>
          <p style={styles.bannedText}><strong>Reason:</strong> {banState.reason}</p>
          <p style={styles.bannedText}>
            <strong>Ban expires:</strong>{' '}
            {banState.expires_at
              ? new Date(banState.expires_at.replace(' ', 'T') + 'Z').toLocaleString()
              : 'Permanent'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppShell darkMode={darkMode} toggleMode={toggleMode} />
    </Router>
  );
}

export default App;

const styles = {
  bannedOverlay: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#111',
    padding: '1rem',
  },
  bannedCard: {
    width: '100%',
    maxWidth: '560px',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    padding: '2rem',
    boxShadow: '0 14px 48px rgba(0,0,0,0.35)',
  },
  bannedTitle: {
    margin: '0 0 1rem 0',
    fontSize: '2rem',
  },
  bannedText: {
    margin: '0.4rem 0',
    color: '#ddd',
  },
  announcementBar: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    width: '100%',
    padding: '10px 14px',
    textAlign: 'center',
    color: '#fff',
    background: 'linear-gradient(90deg, #5f35ff, #8a2be2)',
    borderBottom: '1px solid rgba(255,255,255,0.25)',
    fontWeight: 600,
  },
};