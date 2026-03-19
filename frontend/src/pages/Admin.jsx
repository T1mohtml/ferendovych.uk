import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [namesList, setNamesList] = useState([]);
  const [bannedIps, setBannedIps] = useState([]);
  const [status, setStatus] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [banReason, setBanReason] = useState('Spam / bad language');
  const [banDurationValue, setBanDurationValue] = useState('7');
  const [banDurationUnit, setBanDurationUnit] = useState('days');

  useEffect(() => {
    const storedKey = sessionStorage.getItem('adminKey');
    if (storedKey) {
      setPassword(storedKey);
      setIsAuthenticated(true);
      fetchNames(storedKey);
      fetchBannedIps(storedKey);
    }
  }, []);

  const fetchNames = async (adminKey = password) => {
    try {
      const response = await fetch('/api/get-names', {
        headers: {
          'Admin-Key': adminKey
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNamesList(data);
      }
    } catch (error) {
      console.error('Failed to fetch names:', error);
    }
  };

  const fetchBannedIps = async (adminKey = password) => {
    try {
      const response = await fetch('/api/get-banned-ips', {
        headers: {
          'Admin-Key': adminKey
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBannedIps(data);
      }
    } catch (error) {
      console.error('Failed to fetch banned IPs:', error);
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
        fetchNames(password);
        fetchBannedIps(password);
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
    setBannedIps([]);
  };

  const handleBan = async (ip) => {
    if (!ip) return;
    if (!confirm(`Are you sure you want to ban the IP address ${ip}?`)) return;

    if (banDurationUnit !== 'permanent') {
      const durationNumber = Number(banDurationValue);
      if (!Number.isFinite(durationNumber) || durationNumber <= 0) {
        setStatus('Please set a valid ban duration.');
        return;
      }
    }

    try {
      const response = await fetch('/api/ban-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Admin-Key': password
        },
        body: JSON.stringify({
          ip,
          reason: banReason,
          durationValue: banDurationUnit === 'permanent' ? null : Number(banDurationValue),
          durationUnit: banDurationUnit,
        })
      });

      if (response.ok) {
        const durationLabel = banDurationUnit === 'permanent'
          ? 'permanent'
          : `${banDurationValue} ${banDurationUnit}`;

        setStatus(`IP ${ip} banned (${durationLabel})`);
        fetchBannedIps(password);
        setTimeout(() => setStatus(''), 3000);
      } else {
        const data = await response.json();
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus('Network error banning IP');
    }
  };

  const handleUnban = async (ip) => {
    if (!ip) return;
    if (!confirm(`Unban IP address ${ip}?`)) return;

    try {
      const response = await fetch('/api/unban-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Admin-Key': password,
        },
        body: JSON.stringify({ ip }),
      });

      if (response.ok) {
        setStatus(`IP ${ip} unbanned`);
        setBannedIps((prev) => prev.filter((item) => item.ip_address !== ip));
        setTimeout(() => setStatus(''), 3000);
      } else {
        const data = await response.json();
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus('Network error unbanning IP');
    }
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
          alert('Invalid password');
        }
      }
    } catch (error) {
      setStatus('Network error');
    }
  };

  const formatBanExpiry = (expiresAt) => {
    if (!expiresAt) return 'Permanent';
    const parsed = new Date(expiresAt.replace(' ', 'T') + 'Z');
    if (Number.isNaN(parsed.getTime())) return expiresAt;
    return parsed.toLocaleString();
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
            {loginError && <p style={{ color: '#ff4b4b', margin: 0 }}>{loginError}</p>}
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
        style={{ ...styles.card, maxWidth: '900px' }}
      >
        <div style={styles.header}>
          <h2 style={styles.heading}>Admin Panel 🛡️</h2>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>

        {status && <p style={styles.status}>{status}</p>}

        <div style={styles.configCard}>
          <h3 style={styles.sectionHeading}>Ban Configuration</h3>
          <div style={styles.banConfigRow}>
            <input
              type="text"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Ban reason shown to user"
              style={styles.configInput}
            />

            <input
              type="number"
              min="1"
              value={banDurationUnit === 'permanent' ? '' : banDurationValue}
              onChange={(e) => setBanDurationValue(e.target.value)}
              placeholder="Duration"
              style={{ ...styles.configInput, maxWidth: '120px' }}
              disabled={banDurationUnit === 'permanent'}
            />

            <select
              value={banDurationUnit}
              onChange={(e) => setBanDurationUnit(e.target.value)}
              style={styles.configSelect}
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="permanent">Permanent</option>
            </select>
          </div>
        </div>

        <h3 style={styles.sectionHeading}>Guestbook Entries</h3>
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
                  <br />
                  <span style={styles.listDate}>
                    {new Date(entry.created_at).toLocaleString()} (ID: {entry.id})
                  </span>
                  {entry.ip_address && (
                    <div style={styles.detailsContainer}>
                      <span style={styles.detailItem}><strong>IP:</strong> {entry.ip_address}</span>
                      <span style={styles.detailItem}><strong>Location:</strong> {entry.city ? `${entry.city}, ` : ''}{entry.country}</span>
                      <span style={styles.detailItem}><strong>ASN:</strong> {entry.asn}</span>
                      <span style={styles.detailItem}><strong>Device:</strong> {entry.user_agent}</span>
                    </div>
                  )}
                </div>
                <div style={styles.actionGroup}>
                  {entry.ip_address && (
                    <button
                      onClick={() => handleBan(entry.ip_address)}
                      style={styles.banBtn}
                    >
                      Ban IP
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(entry.id)}
                    style={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
          {namesList.length === 0 && <p>No signatures found.</p>}
        </ul>

        <div style={{ marginTop: '2rem' }}>
          <h3 style={styles.sectionHeading}>Active Bans</h3>
          {bannedIps.length === 0 ? (
            <p style={{ color: '#aaa', margin: 0 }}>No active bans.</p>
          ) : (
            <ul style={styles.list}>
              {bannedIps.map((ban) => (
                <li key={ban.id} style={styles.listItem}>
                  <div>
                    <span style={styles.listName}>{ban.ip_address}</span>
                    <div style={styles.detailsContainer}>
                      <span style={styles.detailItem}><strong>Reason:</strong> {ban.reason || 'No reason provided'}</span>
                      <span style={styles.detailItem}><strong>Expires:</strong> {formatBanExpiry(ban.expires_at)}</span>
                      <span style={styles.detailItem}><strong>Banned at:</strong> {new Date(ban.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <button onClick={() => handleUnban(ban.ip_address)} style={styles.unbanBtn}>Unban</button>
                </li>
              ))}
            </ul>
          )}
        </div>
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
  sectionHeading: {
    margin: '0 0 0.8rem 0',
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
  configCard: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '1rem',
    marginBottom: '1rem',
  },
  banConfigRow: {
    display: 'flex',
    gap: '0.6rem',
    flexWrap: 'wrap',
  },
  configInput: {
    flex: 1,
    minWidth: '220px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(0,0,0,0.2)',
    color: 'white',
  },
  configSelect: {
    minWidth: '140px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(0,0,0,0.2)',
    color: 'white',
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
  actionGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  banBtn: {
    padding: '8px 12px',
    borderRadius: '6px',
    background: '#e69a00',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  unbanBtn: {
    padding: '8px 12px',
    borderRadius: '6px',
    background: '#5f8d4e',
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
    fontSize: '1.05rem',
    wordBreak: 'break-all',
  },
  listDate: {
    fontSize: '0.8rem',
    color: '#aaa',
    display: 'inline-block',
    marginBottom: '0.5rem',
  },
  detailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    marginTop: '0.5rem',
    padding: '0.5rem',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '6px',
    fontSize: '0.85rem',
    color: '#ddd',
  },
  detailItem: {
    wordBreak: 'break-all',
  },
  status: {
    color: '#ffb366',
    marginBottom: '1rem',
  }
};
