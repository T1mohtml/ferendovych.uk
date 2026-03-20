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
    let cancelled = false;

    const loadStatus = async () => {
      try {
        const response = await fetch(`/api/site-status?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        const data = await response.json();
        if (!cancelled && response.ok) {
          const normalized = {
            underConstructionEnabled: data.underConstructionEnabled ?? data.under_construction_enabled ?? false,
            underConstructionTitle: data.underConstructionTitle ?? data.under_construction_title ?? 'Under Construction',
            underConstructionMessage: data.underConstructionMessage ?? data.under_construction_message ?? 'This website is currently under construction. Please check back soon.',
            announcementEnabled: data.announcementEnabled ?? data.announcement_enabled ?? false,
            announcementMessage: data.announcementMessage ?? data.announcement_message ?? '',
            hideNavigationEnabled: data.hideNavigationEnabled ?? data.hide_navigation_enabled ?? false,
          };

          setSiteStatus((prev) => ({ ...prev, ...normalized, loaded: true }));
          return;
        }
      } catch {
        // ignore
      }

      if (!cancelled) {
        setSiteStatus((prev) => ({ ...prev, loaded: true }));
      }
    };

    loadStatus();
    const interval = setInterval(loadStatus, 20000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [location.pathname]);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const showAnnouncement = !isAdminRoute && siteStatus.announcementEnabled && siteStatus.announcementMessage;
  const navVisible = !siteStatus.hideNavigationEnabled;
  const themeTopOffset = navVisible
    ? (showAnnouncement ? 132 : 88)
    : (showAnnouncement ? 64 : 20);

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
      {showAnnouncement && (
        <div style={styles.announcementBar}>{siteStatus.announcementMessage}</div>
      )}
      {navVisible && <Navigation topOffset={showAnnouncement ? 44 : 0} darkMode={darkMode} />}
      <ThemeToggle darkMode={darkMode} toggleMode={toggleMode} topOffset={themeTopOffset} />
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
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;
    return true;
  });
  const [banState, setBanState] = useState({ loading: true, banned: false, reason: '', expires_at: null });

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "#1a1a1a" : "#f0f0f0";
    document.body.style.color = darkMode ? "#f0f0f0" : "#1a1a1a";
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
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

  const toggleMode = () => setDarkMode((prev) => !prev);

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
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1200,
    width: '100%',
    padding: '10px 14px',
    textAlign: 'center',
    color: '#fff',
    background: 'linear-gradient(90deg, #5f35ff, #8a2be2)',
    borderBottom: '1px solid rgba(255,255,255,0.25)',
    fontWeight: 600,
  },
};