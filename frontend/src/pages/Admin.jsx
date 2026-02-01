import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [namesList, setNamesList] = useState([]);
  const [status, setStatus] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  // Check session storage on load
  useEffect(() => {
    const storedKey = sessionStorage.getItem('adminKey');
    if (storedKey) {
      setPassword(storedKey);
      setIsAuthenticated(true);
      fetchNames();
    }
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
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsChecking(true);
    
    try {
      const response = await fetch('/api/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        sessionStorage.setItem('adminKey', password);
        setIsAuthenticated(true);
        fetchNames(); 
      } else {
        setLoginError('Wrong password');
        setPassword('');
      }
    } catch (err) {
      setLoginError('Connection failed');
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminKey');
    setPassword('');
    setIsAuthenticated(false);
    setLoginError('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this specific signature?')) return;

    try {
      const response = await fetch(`/api/delete-name?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Admin-Key': password
        }
      });

      if (response.ok) {
        setStatus('Deleted successfully');
        setNamesList(namesList.filter(item => item.id !== id));
        setTimeout(() => setStatus(''), 3000);
      } else {
        const data = await response.json();
        setStatus(`Error: ${data.error}`);
        if (response.status === 401) {
             // If unauthorized, maybe password changed or is wrong
             alert("Invalid password");
        }
      }
    } catch (error) {
      setStatus('Network error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.container}>
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.card}
        >
          <h2 style={styles.heading}>Admin Access 🔒</h2>
          <form onSubmit={handleLogin} style={styles.form}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Admin Password"
              style={styles.input}
              disabled={isChecking}
            />
            <button type="submit" style={styles.button} disabled={isChecking}>
                {isChecking ? 'Checking...' : 'Unlock'}
            </button>
            {loginError && <p style={{color: '#ff4b4b', margin: 0}}>{loginError}</p>}
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        style={{...styles.card, maxWidth: '800px'}}
      >
        <div style={styles.header}>
            <h2 style={styles.heading}>Admin Panel 🛡️</h2>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
        
        {status && <p style={styles.status}>{status}</p>}

        <ul style={styles.list}>
          <AnimatePresence>
            {namesList.map((entry) => (
              <motion.li 
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                style={styles.listItem}
              >
                <div>
                    <span style={styles.listName}>{entry.name}</span>
                    <br/>
                    <span style={styles.listDate}>
                      {new Date(entry.created_at).toLocaleString()} (ID: {entry.id})
                    </span>
                </div>
                <button 
                    onClick={() => handleDelete(entry.id)}
                    style={styles.deleteBtn}
                >
                    Delete
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
          {namesList.length === 0 && <p>No signatures found.</p>}
        </ul>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '6rem 1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
  },
  heading: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#ffffff',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '2rem',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(0, 0, 0, 0.2)',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: '#646cff',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
  },
  logoutBtn: {
      padding: '8px 16px',
      borderRadius: '6px',
      background: 'rgba(255,255,255,0.1)',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
  },
  deleteBtn: {
      padding: '8px 12px',
      borderRadius: '6px',
      background: '#ff4b4b',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.9rem',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    padding: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    background: 'rgba(0,0,0,0.2)',
    marginBottom: '0.5rem',
    borderRadius: '8px',
  },
  listName: {
      fontWeight: 'bold',
      color: 'white',
  },
  listDate: {
      fontSize: '0.8rem',
      color: '#aaa',
  },
  status: {
      color: '#ff4b4b',
      marginBottom: '1rem',
  }
};
