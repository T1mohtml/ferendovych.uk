import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Turnstile } from '@marsidev/react-turnstile';

export default function NameForm() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [namesList, setNamesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState(null);

  // Replace with your actual Cloudflare Site Key
  const SITE_KEY = '0x4AAAAAACWX4Q_pTGMwm1dQ'; 

  useEffect(() => {
    fetchNames();
  }, []);

  const fetchNames = async () => {
    try {
      const response = await fetch('/api/get-names');
      if (response.ok) {
        const data = await response.json();
        setNamesList(data);
      }
    } catch (error) {
      console.error('Failed to fetch names:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Only require token if Site Key is set to a real value (not the example one)
    // But for now, we'll send whatever we have
    if (SITE_KEY !== '1x00000000000000000000AA' && !turnstileToken) {
       setStatus("Please verify you are human.");
       return;
    }
    
    setStatus('Submitting...');
    
    try {
      const response = await fetch('/api/submit-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, token: turnstileToken }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus('Thanks for signing!');
        setName('');
        fetchNames(); 
        
        // Clear success message after 3 seconds
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus('Failed to connect to the server.');
    }
  };

  return (
    <div style={styles.container}>
      <motion.div 
        style={styles.card}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 style={styles.heading}>Sign the Guestbook ✍️</h2>
        <p style={styles.subtitle}>Leave your mark on my digital wall.</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
              maxLength={50}
              style={styles.input}
            />
            <motion.button 
              type="submit" 
              style={styles.button}
              whileHover={{ scale: 1.02, backgroundColor: '#535bf2' }}
              whileTap={{ scale: 0.98 }}
            >
              Sign
            </motion.button>
          </div>
          
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
            <Turnstile siteKey={SITE_KEY} onSuccess={setTurnstileToken} />
          </div>

        </form>
        
        <AnimatePresence>
          {status && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={styles.status}
            >
              {status}
            </motion.p>
          )}
        </AnimatePresence>

        <div style={styles.listContainer}>
          <h3 style={styles.listHeading}>Recent Signatures</h3>
          
          {loading ? (
             <p style={{ opacity: 0.5 }}>Loading signatures...</p>
          ) : namesList.length === 0 ? (
            <p style={{ opacity: 0.5, fontStyle: 'italic' }}>Be the first to sign!</p>
          ) : (
            <ul style={styles.list}>
              <AnimatePresence>
                {namesList.map((entry, index) => (
                  <motion.li 
                    key={index} 
                    style={styles.listItem}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <span style={styles.listName}>{entry.name}</span>
                    <span style={styles.listDate}>
                      {new Date(entry.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    padding: '0 1rem',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  heading: {
    margin: '0 0 0.5rem 0',
    fontSize: '2rem',
    color: '#a1a1aa',
    fontWeight: '700',
  },
  subtitle: {
    margin: '0 0 2rem 0',
    color: '#cccccc',
    fontSize: '1rem',
  },
  form: {
    marginBottom: '2rem',
  },
  inputGroup: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(0, 0, 0, 0.2)',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    background: '#646cff',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
  },
  status: {
    margin: '0 0 1rem 0',
    color: '#646cff',
    fontSize: '0.9rem',
    overflow: 'hidden',
  },
  listContainer: {
    marginTop: '2rem',
    textAlign: 'left',
  },
  listHeading: {
    fontSize: '1.2rem',
    marginBottom: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '0.5rem',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    maxHeight: '300px',
    overflowY: 'auto',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  listName: {
    fontWeight: '500',
    fontSize: '1.1rem',
  },
  listDate: {
    fontSize: '0.85rem',
    opacity: 0.5,
  },
};
