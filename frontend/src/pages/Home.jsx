import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import profileImage from "../assets/me.jpeg";
import NameForm from "../components/NameForm";

function SkidBanner() {
  const [showShame, setShowShame] = useState(false);
  const [caseId, setCaseId] = useState("");

  useEffect(() => {
    // 1. Check for the "shame cookie" set by Middleware
    if (document.cookie.includes('visitor_type=skid')) {
      setShowShame(true);
      
      // Lock the screen so he can't scroll away from the FBI
      document.body.style.overflow = 'hidden';

      // 2. Generate the fake Government Case ID
      const year = new Date().getFullYear();
      const randomHex = Math.floor(Math.random() * 0xffffffff).toString(16).toUpperCase();
      setCaseId(`CF-${year}-${randomHex}`);

      // 3. Optional: Scare him if he tries to close the tab
      window.onbeforeunload = () => "CRIMINAL INVESTIGATION IN PROGRESS: CLOSING THIS WINDOW WILL BE LOGGED AS OBSTRUCTION OF JUSTICE.";
    }
    
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  if (!showShame) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#000',
      color: '#fff',
      zIndex: 999999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Times New Roman", Times, serif',
      textAlign: 'center',
      padding: '40px',
      overflow: 'hidden'
    }}>
      {/* FBI SEAL */}
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Seal_of_the_Federal_Bureau_of_Investigation.svg/2048px-Seal_of_the_Federal_Bureau_of_Investigation.svg.png" 
        alt="FBI SEAL"
        style={{ width: '220px', marginBottom: '20px' }}
      />

      <h1 style={{ 
        backgroundColor: '#002654', 
        color: '#fff', 
        width: '100vw', 
        padding: '15px 0',
        fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
        borderTop: '5px solid #fff',
        borderBottom: '5px solid #fff',
        marginBottom: '30px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '2px'
      }}>
        Federal Bureau of Investigation
      </h1>

      <div style={{ maxWidth: '900px', width: '100%' }}>
        <h2 style={{ color: '#ff0000', fontSize: '1.8rem', marginBottom: '20px' }}>
          ACCESS RESTRICTED: CRIMINAL INVESTIGATION
        </h2>
        
        <p style={{ textAlign: 'justify', fontSize: '1.1rem', marginBottom: '25px', color: '#ccc' }}>
          This device has been flagged for unauthorized use of automated fuzzing tools (<b>FFuF / Go-http-client</b>) against protected infrastructure. 
          Under the Computer Fraud and Abuse Act (CFAA), unauthorized access to this system is a federal crime. 
          Your physical location, IP address, and MAC address have been recorded.
        </p>

        <div style={{ 
          backgroundColor: '#111', 
          border: '1px solid #444', 
          padding: '20px', 
          fontFamily: 'monospace',
          textAlign: 'left',
          position: 'relative'
        }}>
          <p style={{ margin: '0 0 8px 0', color: '#00ff00' }}>[+] INTERCEPT_STATUS: DATA_PACKET_CAPTURED</p>
          <p style={{ margin: '0 0 8px 0', color: '#fff' }}>[+] CASE_IDENTIFIER: <span style={{ color: '#ffff00' }}>{caseId}</span></p>
          <p style={{ margin: '0 0 8px 0', color: '#fff' }}>[+] CLEARANCE_LEVEL: <span style={{ color: '#ff0000' }}>DIRECTOR_LEVEL_ONLY</span></p>
          <p style={{ margin: '0', color: '#00ff00' }}>[+] UPLOADING_EVIDENCE_TO_LOCAL_AUTHORITIES... 88%</p>
        </div>

        <p style={{ marginTop: '30px', fontWeight: 'bold', fontSize: '1.2rem' }}>
          DO NOT ATTEMPT TO POWER OFF OR DISCONNECT THIS DEVICE.
        </p>
        
        <p style={{ marginTop: '40px', fontSize: '0.8rem', opacity: 0.5, fontStyle: 'italic' }}>
          "Trying to look like a hacker for her? You're not in the movies, kid. You're in a browser cookie."
        </p>
      </div>

      {/* Flashing Light Effect */}
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
    document.title = "Home - My Page";
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SkidBanner />
      {/* Rest of your Home component stays exactly the same */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.6, -0.05, 0.01, 0.99] }}
        style={styles.heroSection}
      >
        <div style={styles.textWrapper}>
          <motion.h1 style={styles.heading}>Hey! I'm Timo 👋</motion.h1>
          <motion.p style={styles.text}>Welcome to my personal website.</motion.p>
          {/* ... all your other hero/about content ... */}
        </div>
      </motion.div>
      {/* ... the rest of the file ... */}
    </>
  );
}

const styles = {
    // Keep your styles object exactly as it was
}