import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import profileImage from "../assets/me.jpeg";
import NameForm from "../components/NameForm";

function SkidBanner() {
  const [showShame, setShowShame] = useState(false);
  const [caseId, setCaseId] = useState("");
  const [isMercyVisible, setIsMercyVisible] = useState(false);

  useEffect(() => {
    const check = () => {
      if (document.cookie.includes('visitor_type=skid')) {
        setShowShame(true);
        document.body.style.overflow = 'hidden';
        const year = new Date().getFullYear();
        const randomHex = Math.floor(Math.random() * 0xffffffff).toString(16).toUpperCase();
        setCaseId(`CF-${year}-${randomHex}`);
        
        // Anti-close warning
        window.onbeforeunload = () => "CRIMINAL INVESTIGATION IN PROGRESS: CLOSING THIS WINDOW WILL BE LOGGED AS OBSTRUCTION OF JUSTICE.";
        
        // Mercy Timer: Show redemption button after 15 seconds
        setTimeout(() => {
          setIsMercyVisible(true);
        }, 15000);
      }
    };
    check();
    const interval = setInterval(check, 2000);
    return () => clearInterval(interval);
  }, []);

  const clearCookie = () => {
    document.cookie = "visitor_type=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.body.style.overflow = 'unset';
    window.onbeforeunload = null;
    setShowShame(false);
    window.location.reload(); 
  };

  if (!showShame) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: '#000', color: '#fff',
      zIndex: 2147483647, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', fontFamily: '"Times New Roman", serif',
      textAlign: 'center', padding: '40px', overflow: 'hidden'
    }}>
      <button 
        onClick={clearCookie}
        style={{
          position: 'absolute', top: '10px', right: '10px',
          background: 'transparent', border: 'none', color: '#0a0a0a', 
          cursor: 'pointer', fontSize: '12px', zIndex: 10
        }}
      >
        [BYPASS_INTERNAL_404]
      </button>

      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Seal_of_the_Federal_Bureau_of_Investigation.svg/2048px-Seal_of_the_Federal_Bureau_of_Investigation.svg.png" 
        alt="FBI SEAL"
        style={{ width: '220px', marginBottom: '20px' }}
      />

      <h1 style={{ 
        backgroundColor: '#002654', color: '#fff', width: '100vw', padding: '15px 0',
        fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', borderTop: '5px solid #fff',
        borderBottom: '5px solid #fff', marginBottom: '30px', fontWeight: 'bold',
        textTransform: 'uppercase', letterSpacing: '2px'
      }}>
        Federal Bureau of Investigation
      </h1>

      <div style={{ maxWidth: '900px', width: '100%' }}>
        <h2 style={{ color: '#ff0000', fontSize: '1.8rem', marginBottom: '20px' }}>
          ACCESS RESTRICTED: CRIMINAL INVESTIGATION
        </h2>
        
        <p style={{ textAlign: 'justify', fontSize: '1.1rem', marginBottom: '25px', color: '#ccc' }}>
          This device has been flagged for unauthorized use of automated fuzzing tools (<b>FFuF / Go-http-client</b>) against protected infrastructure. 
          Under the CFAA, unauthorized access is a federal crime. Your IP and activity have been recorded.
        </p>

        <div style={{ 
          backgroundColor: '#111', border: '1px solid #444', padding: '20px', 
          fontFamily: 'monospace', textAlign: 'left'
        }}>
          <p style={{ margin: '0 0 8px 0', color: '#00ff00' }}>[+] INTERCEPT_STATUS: DATA_PACKET_CAPTURED</p>
          <p style={{ margin: '0 0 8px 0', color: '#fff' }}>[+] CASE_ID: <span style={{ color: '#ffff00' }}>{caseId}</span></p>
          <p style={{ margin: '0 0 8px 0', color: '#fff' }}>[+] CLEARANCE: <span style={{ color: '#ff0000' }}>DIRECTOR_LEVEL_ONLY</span></p>
          <p style={{ margin: '0', color: '#00ff00' }}>[+] UPLOADING_TO_QUANTICO... 88%</p>
        </div>

        {/* Mercy Section: Appears after 15s */}
        {isMercyVisible ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: '30px', padding: '20px', border: '1px dashed #00ff00', borderRadius: '8px' }}
          >
            <p style={{ color: '#00ff00', marginBottom: '15px', fontWeight: 'bold' }}>
              [SYSTEM MESSAGE]: This was a simulated security deterrent.
            </p>
            <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '20px' }}>
              Scanning personal websites is bad practice. Please be more respectful of web boundaries.
            </p>
            <button 
              onClick={clearCookie}
              style={{
                padding: '10px 25px', backgroundColor: '#00ff00', color: '#000',
                border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              I understand, let me back in
            </button>
          </motion.div>
        ) : (
          <p style={{ marginTop: '30px', fontWeight: 'bold', fontSize: '1.2rem' }}>
            DO NOT CLOSE THIS WINDOW.
          </p>
        )}
        
        <p style={{ marginTop: '40px', fontSize: '0.8rem', opacity: 0.5, fontStyle: 'italic' }}>
          "Trying to look like a hacker? You're not in the movies, kid. You're in a browser cookie."
        </p>
      </div>

      <motion.div 
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'radial-gradient(circle, rgba(255,0,0,0.2) 0%, rgba(0,0,255,0.2) 100%)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}

export default function Home() {
  useEffect(() => {
    document.title = "Home - Timo";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={styles.pageContainer}>
      <SkidBanner />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.6, -0.05, 0.01, 0.99] }}
        style={styles.heroSection}
      >
        <img src={profileImage} alt="Profile" style={styles.profileImg} />
        <div style={styles.textWrapper}>
          <h1 style={styles.heading}>Hey! I'm Timo 👋</h1>
          <p style={styles.text}>Welcome to my personal website.</p>
        </div>
      </motion.div>

      <section id="guestbook" style={styles.section}>
        <NameForm />
      </section>
    </div>
  );
}

const styles = {
  pageContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#fff", 
    minHeight: "100vh",
  },
  heroSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "100px 20px",
    minHeight: "80vh",
  },
  profileImg: {
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    marginBottom: "20px",
    objectFit: "cover",
  },
  heading: {
    fontSize: "3rem",
    margin: "10px 0",
    color: "#333",
  },
  text: {
    fontSize: "1.2rem",
    color: "#666",
  },
  section: {
    width: "100%",
    maxWidth: "800px",
    padding: "50px 20px",
  }
};