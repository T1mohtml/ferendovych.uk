import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Turnstile } from '@marsidev/react-turnstile';

const AVATAR_COLORS = ['#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626'];
const getInitial = (n) => (n ? n.trim()[0].toUpperCase() : '?');
const getAvatarColor = (n) => AVATAR_COLORS[(n ? n.charCodeAt(0) : 0) % AVATAR_COLORS.length];

export default function NameForm() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [namesList, setNamesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [website, setWebsite] = useState('');
  const [isGuestbookLocked, setIsGuestbookLocked] = useState(false);
  const [guestbookLockMessage, setGuestbookLockMessage] = useState('Guestbook is temporarily locked by admin.');

  const SITE_KEY = '0x4AAAAAACWX4Q_pTGMwm1dQ';

  useEffect(() => {
    fetchNames();
    fetchSiteStatus();
  }, []);

  const fetchSiteStatus = async () => {
    try {
      const response = await fetch('/api/site-status');
      if (!response.ok) return;
      const data = await response.json();
      setIsGuestbookLocked(Boolean(data?.guestbookLocked));
      setGuestbookLockMessage(data?.guestbookLockMessage || 'Guestbook is temporarily locked by admin.');
    } catch (error) {
      console.error('Failed to fetch site status:', error);
    }
  };

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

    if (isGuestbookLocked) {
      setStatus(guestbookLockMessage);
      setStatusType('error');
      return;
    }

    if (SITE_KEY !== '1x00000000000000000000AA' && !turnstileToken) {
      setStatus('Please verify you are human.');
      setStatusType('error');
      return;
    }

    setStatus('Submitting...');
    setStatusType('info');

    try {
      const response = await fetch('/api/submit-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, token: turnstileToken, website }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(data?.message || 'Thanks for signing! ✨');
        setStatusType('success');
        setName('');
        setWebsite('');
        fetchNames();
        setTimeout(() => setStatus(''), 3000);
      } else {
        if (response.status === 403 && data?.reason) {
          const expiresLabel = data.expires_at
            ? new Date(data.expires_at.replace(' ', 'T') + 'Z').toLocaleString()
            : 'Permanent';
          setStatus(`Banned: ${data.reason}. Expires: ${expiresLabel}`);
        } else if (response.status === 403 && data?.code === 'GUESTBOOK_LOCKED') {
          setStatus(data.error || 'Guestbook is temporarily locked by admin.');
        } else {
          setStatus(`Error: ${data.error}`);
        }
        setStatusType('error');
      }
    } catch (error) {
      setStatus('Failed to connect to the server.');
      setStatusType('error');
    }
  };

  return (
    <>
      <style>{`
        .gb-input:focus {
          border-color: rgba(124,58,237,0.7) !important;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.15) !important;
        }
        .gb-list::-webkit-scrollbar { width: 4px; }
        .gb-list::-webkit-scrollbar-track { background: transparent; }
        .gb-list::-webkit-scrollbar-thumb {
          background: rgba(124,58,237,0.3);
          border-radius: 2px;
        }
        .gb-list::-webkit-scrollbar-thumb:hover { background: rgba(124,58,237,0.55); }
        .gb-item:hover { background: rgba(255,255,255,0.04); }
      `}</style>

      <div style={styles.container}>
        <motion.div
          style={styles.card}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* decorative glow orb */}
          <div style={styles.orb} />

          {/* header */}
          <div style={styles.headerRow}>
            <div>
              <h2 style={styles.heading}>
                <span style={styles.headingGradient}>Sign the Guestbook</span>
                {' '}✍️
              </h2>
              <p style={styles.subtitle}>Leave your mark on my digital wall.</p>
            </div>
            <div style={styles.countBadge}>
              <span style={styles.countNumber}>{namesList.length}</span>
              <span style={styles.countLabel}>signatures</span>
            </div>
          </div>

          {isGuestbookLocked && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.lockBanner}
            >
              <span style={{ marginRight: '0.5em' }}>🔒</span>
              {guestbookLockMessage}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* honeypot */}
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              autoComplete="off"
              tabIndex={-1}
              aria-hidden="true"
              style={styles.honeypotInput}
            />

            <div style={styles.inputGroup}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name…"
                required
                maxLength={50}
                className="gb-input"
                style={styles.input}
                disabled={isGuestbookLocked}
              />
              <motion.button
                type="submit"
                style={{
                  ...styles.button,
                  opacity: isGuestbookLocked ? 0.45 : 1,
                  cursor: isGuestbookLocked ? 'not-allowed' : 'pointer',
                }}
                disabled={isGuestbookLocked}
                whileHover={!isGuestbookLocked ? { scale: 1.04 } : {}}
                whileTap={!isGuestbookLocked ? { scale: 0.96 } : {}}
              >
                Sign ✦
              </motion.button>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
              {!isGuestbookLocked && <Turnstile siteKey={SITE_KEY} onSuccess={setTurnstileToken} />}
            </div>
          </form>

          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                style={{
                  ...styles.statusBanner,
                  ...(statusType === 'success' ? styles.statusSuccess
                    : statusType === 'error' ? styles.statusError
                    : styles.statusInfo),
                }}
              >
                {status}
              </motion.div>
            )}
          </AnimatePresence>

          {/* signatures list */}
          <div style={styles.listContainer}>
            <div style={styles.listHeadingRow}>
              <h3 style={styles.listHeading}>Recent Signatures</h3>
              <div style={styles.listHeadingLine} />
            </div>

            {loading ? (
              <div style={styles.skeletonContainer}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ ...styles.skeletonItem, opacity: 1 - i * 0.28 }}>
                    <div style={styles.skeletonAvatar} />
                    <div style={{ flex: 1 }}>
                      <div style={{ ...styles.skeletonLine, width: `${45 + i * 12}%` }} />
                    </div>
                    <div style={{ ...styles.skeletonLine, width: '56px' }} />
                  </div>
                ))}
              </div>
            ) : namesList.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={styles.emptyState}
              >
                <div style={styles.emptyIcon}>💌</div>
                <p style={styles.emptyText}>Be the first to sign!</p>
              </motion.div>
            ) : (
              <ul className="gb-list" style={styles.list}>
                <AnimatePresence>
                  {namesList.map((entry, index) => (
                    <motion.li
                      key={index}
                      className="gb-item"
                      style={styles.listItem}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04, ease: 'easeOut' }}
                    >
                      <div style={styles.listItemLeft}>
                        <div style={{ ...styles.avatar, background: getAvatarColor(entry.name) }}>
                          {getInitial(entry.name)}
                        </div>
                        <span style={styles.listName}>{entry.name}</span>
                      </div>
                      <span style={styles.listDate}>
                        {new Date(entry.created_at).toLocaleDateString([], {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </motion.div>
      </div>
    </>
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
    position: 'relative',
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.09)',
  },
  orb: {
    position: 'absolute',
    top: '-70px',
    right: '-70px',
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.75rem',
  },
  heading: {
    margin: '0 0 0.3rem 0',
    fontSize: '1.85rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  headingGradient: {
    background: 'linear-gradient(135deg, #c4b5fd 0%, #818cf8 50%, #a5f3fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    margin: 0,
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.9rem',
  },
  countBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(124,58,237,0.1)',
    border: '1px solid rgba(124,58,237,0.22)',
    borderRadius: '12px',
    padding: '0.5rem 0.9rem',
    flexShrink: 0,
    marginLeft: '1rem',
  },
  countNumber: {
    fontSize: '1.45rem',
    fontWeight: '700',
    color: '#c4b5fd',
    lineHeight: 1,
  },
  countLabel: {
    fontSize: '0.6rem',
    color: 'rgba(196,181,253,0.55)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginTop: '3px',
  },
  lockBanner: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(251,146,60,0.1)',
    border: '1px solid rgba(251,146,60,0.28)',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    color: '#fb923c',
    fontSize: '0.88rem',
    marginBottom: '1.5rem',
  },
  form: {
    marginBottom: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.11)',
    background: 'rgba(0,0,0,0.28)',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  button: {
    padding: '12px 22px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: '700',
    outline: 'none',
    letterSpacing: '0.01em',
    boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
    flexShrink: 0,
  },
  statusBanner: {
    borderRadius: '10px',
    padding: '0.7rem 1rem',
    fontSize: '0.88rem',
    marginBottom: '1.25rem',
    overflow: 'hidden',
  },
  statusSuccess: {
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.28)',
    color: '#34d399',
  },
  statusError: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.28)',
    color: '#f87171',
  },
  statusInfo: {
    background: 'rgba(124,58,237,0.08)',
    border: '1px solid rgba(124,58,237,0.22)',
    color: '#c4b5fd',
  },
  honeypotInput: {
    position: 'absolute',
    left: '-9999px',
    width: '1px',
    height: '1px',
    opacity: 0,
    pointerEvents: 'none',
  },
  listContainer: {
    marginTop: '1.5rem',
  },
  listHeadingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  listHeading: {
    fontSize: '0.72rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'rgba(255,255,255,0.3)',
    margin: 0,
    whiteSpace: 'nowrap',
  },
  listHeadingLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.07)',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    maxHeight: '320px',
    overflowY: 'auto',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '9px 8px',
    borderRadius: '8px',
    transition: 'background 0.15s',
  },
  listItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: 'white',
    flexShrink: 0,
  },
  listName: {
    fontWeight: '500',
    fontSize: '0.97rem',
    color: 'rgba(255,255,255,0.85)',
  },
  listDate: {
    fontSize: '0.77rem',
    color: 'rgba(255,255,255,0.28)',
    fontVariantNumeric: 'tabular-nums',
  },
  skeletonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  skeletonItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
    padding: '9px 8px',
  },
  skeletonAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.07)',
    flexShrink: 0,
  },
  skeletonLine: {
    height: '11px',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.07)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2.5rem 1rem',
    gap: '0.6rem',
  },
  emptyIcon: {
    fontSize: '2.2rem',
    lineHeight: 1,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.28)',
    fontStyle: 'italic',
    fontSize: '0.92rem',
    margin: 0,
  },
};
