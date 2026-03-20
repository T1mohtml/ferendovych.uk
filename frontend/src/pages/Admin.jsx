import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [namesList, setNamesList] = useState([]);
  const [bannedIps, setBannedIps] = useState([]);
  const [bannedAsns, setBannedAsns] = useState([]);
  const [status, setStatus] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [banReason, setBanReason] = useState('Spam / bad language');
  const [banDurationValue, setBanDurationValue] = useState('7');
  const [banDurationUnit, setBanDurationUnit] = useState('days');
  const [manualIp, setManualIp] = useState('');
  const [manualAsn, setManualAsn] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [nameSearch, setNameSearch] = useState('');
  const [sortDirection, setSortDirection] = useState('desc');
  const [deleteIpInput, setDeleteIpInput] = useState('');
  const [guestbookLocked, setGuestbookLocked] = useState(false);
  const [guestbookLockMessage, setGuestbookLockMessage] = useState('Guestbook is temporarily locked by admin.');
  const [cooldownEnabled, setCooldownEnabled] = useState(true);
  const [cooldownMinutes, setCooldownMinutes] = useState(5);
  const [subnetProtectionEnabled, setSubnetProtectionEnabled] = useState(true);
  const [autoBanEnabled, setAutoBanEnabled] = useState(true);
  const [diagnostics, setDiagnostics] = useState(null);
  const [operationsData, setOperationsData] = useState(null);

  useEffect(() => {
    const storedKey = sessionStorage.getItem('adminKey');
    if (storedKey) {
      setPassword(storedKey);
      setIsAuthenticated(true);
      refreshAll(storedKey);
    }
  }, []);

  const refreshAll = async (adminKey = password) => {
    await Promise.all([
      fetchNames(adminKey),
      fetchBannedIps(adminKey),
      fetchBannedAsns(adminKey),
      fetchAdminSettings(adminKey),
      fetchDiagnostics(adminKey),
      fetchOperations(adminKey),
    ]);
  };

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

  const fetchBannedAsns = async (adminKey = password) => {
    try {
      const response = await fetch('/api/get-banned-asns', {
        headers: {
          'Admin-Key': adminKey
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBannedAsns(data);
      }
    } catch (error) {
      console.error('Failed to fetch banned ASNs:', error);
    }
  };

  const fetchAdminSettings = async (adminKey = password) => {
    try {
      const response = await fetch('/api/admin-settings', {
        headers: {
          'Admin-Key': adminKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGuestbookLocked(Boolean(data.guestbook_locked));
        setGuestbookLockMessage(data.guestbook_lock_message || 'Guestbook is temporarily locked by admin.');
        setCooldownEnabled(data.cooldown_enabled !== false);
        setCooldownMinutes(Number(data.cooldown_minutes || 5));
        setSubnetProtectionEnabled(data.subnet_protection_enabled !== false);
        setAutoBanEnabled(data.auto_ban_enabled !== false);
      }
    } catch (error) {
      console.error('Failed to fetch admin settings:', error);
    }
  };

  const fetchDiagnostics = async (adminKey = password) => {
    try {
      const response = await fetch('/api/admin-diagnostics', {
        headers: {
          'Admin-Key': adminKey
        }
      });

      if (response.ok) {
        setDiagnostics(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch diagnostics:', error);
    }
  };

  const fetchOperations = async (adminKey = password) => {
    try {
      const response = await fetch('/api/admin-operations', {
        headers: {
          'Admin-Key': adminKey
        }
      });

      if (response.ok) {
        setOperationsData(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch operations:', error);
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
        refreshAll(password);
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
    setBannedAsns([]);
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

  const handleManualBanOrExtend = () => {
    const ip = manualIp.trim();
    if (!ip) {
      setStatus('Type an IP address first.');
      return;
    }

    handleBan(ip);
  };

  const handleBanAsn = async (asn) => {
    const normalizedAsn = String(asn || '').trim().toUpperCase();
    if (!normalizedAsn) return;
    if (!confirm(`Ban/extend ASN ${normalizedAsn}?`)) return;

    if (banDurationUnit !== 'permanent') {
      const durationNumber = Number(banDurationValue);
      if (!Number.isFinite(durationNumber) || durationNumber <= 0) {
        setStatus('Please set a valid ban duration.');
        return;
      }
    }

    try {
      const response = await fetch('/api/ban-asn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Admin-Key': password,
        },
        body: JSON.stringify({
          asn: normalizedAsn,
          reason: banReason,
          durationValue: banDurationUnit === 'permanent' ? null : Number(banDurationValue),
          durationUnit: banDurationUnit,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setStatus(data.message || `ASN ${normalizedAsn} updated.`);
        setManualAsn('');
        fetchBannedAsns(password);
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus('Network error banning ASN');
    }
  };

  const handleUnbanAsn = async (asn) => {
    const normalizedAsn = String(asn || '').trim().toUpperCase();
    if (!normalizedAsn) return;
    if (!confirm(`Unban ASN ${normalizedAsn}?`)) return;

    try {
      const response = await fetch('/api/unban-asn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Admin-Key': password,
        },
        body: JSON.stringify({ asn: normalizedAsn }),
      });

      const data = await response.json();
      if (response.ok) {
        setStatus(data.message || `ASN ${normalizedAsn} unbanned.`);
        setBannedAsns((prev) => prev.filter((item) => item.asn !== normalizedAsn));
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus('Network error unbanning ASN');
    }
  };

  const handleManualAsnBan = () => {
    const asn = manualAsn.trim();
    if (!asn) {
      setStatus('Type an ASN first.');
      return;
    }

    handleBanAsn(asn);
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

  const handleDeleteAllNames = async () => {
    if (!confirm('Delete ALL guestbook entries? This cannot be undone.')) return;

    try {
      const response = await fetch('/api/delete-all-names', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Admin-Key': password,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setNamesList([]);
        setStatus(data.message || 'All entries deleted.');
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus('Network error deleting all entries');
    }
  };

  const handleDeleteNamesByIp = async () => {
    const ip = deleteIpInput.trim();
    if (!ip) {
      setStatus('Type an IP address to delete names by IP.');
      return;
    }

    if (!confirm(`Delete all names from IP ${ip}?`)) return;

    try {
      const response = await fetch('/api/delete-names-by-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Admin-Key': password,
        },
        body: JSON.stringify({ ip }),
      });

      const data = await response.json();
      if (response.ok) {
        setStatus(`${data.deleted || 0} entries deleted for ${ip}`);
        setDeleteIpInput('');
        fetchNames(password);
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus('Network error deleting names by IP');
    }
  };

  const handleSaveWebsiteSettings = async () => {
    try {
      const response = await fetch('/api/admin-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Admin-Key': password,
        },
        body: JSON.stringify({
          guestbookLocked,
          guestbookLockMessage,
          cooldownEnabled,
          cooldownMinutes: Number(cooldownMinutes),
          subnetProtectionEnabled,
          autoBanEnabled,
        })
      });

      const data = await response.json();
      if (response.ok) {
        setGuestbookLocked(Boolean(data.guestbook_locked));
        setGuestbookLockMessage(data.guestbook_lock_message || guestbookLockMessage);
        setCooldownEnabled(data.cooldown_enabled !== false);
        setCooldownMinutes(Number(data.cooldown_minutes || 5));
        setSubnetProtectionEnabled(data.subnet_protection_enabled !== false);
        setAutoBanEnabled(data.auto_ban_enabled !== false);
        setStatus('Website settings saved.');
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus('Network error saving website settings');
    }
  };

  const filteredNames = useMemo(() => {
    const term = nameSearch.trim().toLowerCase();

    const filtered = namesList.filter((entry) => {
      if (!term) return true;
      const searchText = [
        entry.name,
        entry.ip_address,
        entry.country,
        entry.city,
        entry.asn,
        entry.user_agent,
      ].join(' ').toLowerCase();

      return searchText.includes(term);
    });

    filtered.sort((a, b) => {
      const aTs = new Date(a.created_at).getTime();
      const bTs = new Date(b.created_at).getTime();
      return sortDirection === 'desc' ? bTs - aTs : aTs - bTs;
    });

    return filtered;
  }, [namesList, nameSearch, sortDirection]);

  const stats = useMemo(() => {
    const uniqueIps = new Set(namesList.map((n) => n.ip_address).filter(Boolean));
    return {
      totalNames: namesList.length,
      uniqueIps: uniqueIps.size,
      activeBans: bannedIps.length,
      activeAsnBans: bannedAsns.length,
      guestbookStatus: guestbookLocked ? 'Locked' : 'Open',
    };
  }, [namesList, bannedIps, bannedAsns, guestbookLocked]);

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

        <div style={styles.tabBar}>
          <button onClick={() => setActiveTab('overview')} style={activeTab === 'overview' ? styles.activeTabBtn : styles.tabBtn}>Overview</button>
          <button onClick={() => setActiveTab('names')} style={activeTab === 'names' ? styles.activeTabBtn : styles.tabBtn}>Names</button>
          <button onClick={() => setActiveTab('bans')} style={activeTab === 'bans' ? styles.activeTabBtn : styles.tabBtn}>Bans</button>
          <button onClick={() => setActiveTab('website')} style={activeTab === 'website' ? styles.activeTabBtn : styles.tabBtn}>Website</button>
          <button onClick={() => refreshAll(password)} style={styles.secondaryBtn}>Refresh</button>
        </div>

        {activeTab === 'overview' && (
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionHeading}>Overview</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}><strong>Total names:</strong><br />{stats.totalNames}</div>
              <div style={styles.statCard}><strong>Unique IPs:</strong><br />{stats.uniqueIps}</div>
              <div style={styles.statCard}><strong>Active bans:</strong><br />{stats.activeBans}</div>
              <div style={styles.statCard}><strong>ASN bans:</strong><br />{stats.activeAsnBans}</div>
              <div style={styles.statCard}><strong>Guestbook:</strong><br />{stats.guestbookStatus}</div>
            </div>
          </div>
        )}

        {activeTab === 'names' && (
          <>
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionHeading}>Name Controls</h3>
              <div style={styles.controlRow}>
                <input
                  type="text"
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  placeholder="Search by name/IP/country/city/device"
                  style={styles.configInput}
                />
                <select
                  value={sortDirection}
                  onChange={(e) => setSortDirection(e.target.value)}
                  style={styles.configSelect}
                >
                  <option value="desc">Newest first</option>
                  <option value="asc">Oldest first</option>
                </select>
              </div>
              <div style={styles.controlRow}>
                <input
                  type="text"
                  value={deleteIpInput}
                  onChange={(e) => setDeleteIpInput(e.target.value)}
                  placeholder="Delete all names by IP"
                  style={styles.configInput}
                />
                <button onClick={handleDeleteNamesByIp} style={styles.deleteBtn}>Delete by IP</button>
                <button onClick={handleDeleteAllNames} style={styles.deleteBtn}>Delete ALL names</button>
              </div>
            </div>

            <h3 style={styles.sectionHeading}>Guestbook Entries</h3>
            <ul style={styles.list}>
              <AnimatePresence>
                {filteredNames.map((entry) => (
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
                      {entry.asn && entry.asn !== 'Unknown ASN' && (
                        <button
                          onClick={() => handleBanAsn(entry.asn)}
                          style={styles.banBtn}
                        >
                          Ban ASN
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
              {filteredNames.length === 0 && <p>No signatures found.</p>}
            </ul>
          </>
        )}

        {activeTab === 'bans' && (
          <>
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

              <div style={styles.manualActionRow}>
                <input
                  type="text"
                  value={manualIp}
                  onChange={(e) => setManualIp(e.target.value)}
                  placeholder="Type IP manually (e.g. 1.2.3.4)"
                  style={styles.configInput}
                />
                <button onClick={handleManualBanOrExtend} style={styles.banBtn}>
                  Ban / Extend IP
                </button>
              </div>

              <div style={styles.manualActionRow}>
                <input
                  type="text"
                  value={manualAsn}
                  onChange={(e) => setManualAsn(e.target.value)}
                  placeholder="Type ASN manually (e.g. AS13335)"
                  style={styles.configInput}
                />
                <button onClick={handleManualAsnBan} style={styles.banBtn}>
                  Ban / Extend ASN
                </button>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
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
                      <div style={styles.actionGroup}>
                        <button onClick={() => handleBan(ban.ip_address)} style={styles.banBtn}>Extend</button>
                        <button onClick={() => handleUnban(ban.ip_address)} style={styles.unbanBtn}>Unban</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <h3 style={styles.sectionHeading}>Active ASN Bans</h3>
              {bannedAsns.length === 0 ? (
                <p style={{ color: '#aaa', margin: 0 }}>No active ASN bans.</p>
              ) : (
                <ul style={styles.list}>
                  {bannedAsns.map((ban) => (
                    <li key={ban.id} style={styles.listItem}>
                      <div>
                        <span style={styles.listName}>{ban.asn}</span>
                        <div style={styles.detailsContainer}>
                          <span style={styles.detailItem}><strong>Reason:</strong> {ban.reason || 'No reason provided'}</span>
                          <span style={styles.detailItem}><strong>Expires:</strong> {formatBanExpiry(ban.expires_at)}</span>
                          <span style={styles.detailItem}><strong>Banned at:</strong> {new Date(ban.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <div style={styles.actionGroup}>
                        <button onClick={() => handleBanAsn(ban.asn)} style={styles.banBtn}>Extend</button>
                        <button onClick={() => handleUnbanAsn(ban.asn)} style={styles.unbanBtn}>Unban</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {activeTab === 'website' && (
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionHeading}>Website Controls</h3>
            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={guestbookLocked}
                onChange={(e) => setGuestbookLocked(e.target.checked)}
              />
              Lock guestbook submissions
            </label>
            <textarea
              value={guestbookLockMessage}
              onChange={(e) => setGuestbookLockMessage(e.target.value)}
              placeholder="Message shown while guestbook is locked"
              style={styles.textArea}
            />
            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={cooldownEnabled}
                onChange={(e) => setCooldownEnabled(e.target.checked)}
              />
              Enable posting cooldown
            </label>
            <div style={styles.controlRow}>
              <input
                type="number"
                min="1"
                value={cooldownMinutes}
                onChange={(e) => setCooldownMinutes(e.target.value)}
                style={{ ...styles.configInput, maxWidth: '180px' }}
                disabled={!cooldownEnabled}
              />
              <span style={{ color: '#bbb', alignSelf: 'center' }}>minutes between posts</span>
            </div>

            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={subnetProtectionEnabled}
                onChange={(e) => setSubnetProtectionEnabled(e.target.checked)}
              />
              Enable subnet flood protection
            </label>

            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={autoBanEnabled}
                onChange={(e) => setAutoBanEnabled(e.target.checked)}
              />
              Enable auto-ban from abuse scoring
            </label>

            <button onClick={handleSaveWebsiteSettings} style={styles.button}>Save Website Settings</button>

            <div style={{ marginTop: '1rem' }}>
              <h3 style={styles.sectionHeading}>Server Diagnostics</h3>
              <div style={styles.controlRow}>
                <button onClick={() => fetchDiagnostics(password)} style={styles.secondaryBtn}>Refresh Diagnostics</button>
                <button onClick={() => fetchOperations(password)} style={styles.secondaryBtn}>Refresh Operations</button>
              </div>
              {diagnostics ? (
                <div style={styles.detailsContainer}>
                  <span style={styles.detailItem}><strong>Server time:</strong> {diagnostics.serverTime}</span>
                  <span style={styles.detailItem}><strong>Platform:</strong> {diagnostics.runtime?.platform}</span>
                  <span style={styles.detailItem}><strong>D1 connected:</strong> {String(diagnostics.runtime?.hasD1)}</span>
                  <span style={styles.detailItem}><strong>IP:</strong> {diagnostics.requestContext?.ip || 'n/a'}</span>
                  <span style={styles.detailItem}><strong>Country/City:</strong> {diagnostics.requestContext?.country || 'n/a'} / {diagnostics.requestContext?.city || 'n/a'}</span>
                  <span style={styles.detailItem}><strong>ASN:</strong> {diagnostics.requestContext?.asn || 'n/a'}</span>
                  <span style={styles.detailItem}><strong>Colo:</strong> {diagnostics.requestContext?.colo || 'n/a'}</span>
                  <span style={styles.detailItem}><strong>TLS/HTTP:</strong> {diagnostics.requestContext?.tlsVersion || 'n/a'} / {diagnostics.requestContext?.httpProtocol || 'n/a'}</span>
                  <span style={styles.detailItem}><strong>Total names:</strong> {diagnostics.securityStats?.namesCount ?? 0}</span>
                  <span style={styles.detailItem}><strong>Active IP bans:</strong> {diagnostics.securityStats?.activeIpBans ?? 0}</span>
                  <span style={styles.detailItem}><strong>Active ASN bans:</strong> {diagnostics.securityStats?.activeAsnBans ?? 0}</span>
                  <span style={styles.detailItem}><strong>High-risk IPs:</strong> {diagnostics.securityStats?.highRiskIps ?? 0}</span>
                  <span style={styles.detailItem}><strong>Has ADMIN_PASSWORD:</strong> {String(diagnostics.environmentFlags?.hasAdminPassword)}</span>
                  <span style={styles.detailItem}><strong>Has TURNSTILE key:</strong> {String(diagnostics.environmentFlags?.hasTurnstileSecret)}</span>
                  <span style={styles.detailItem}><strong>Has Discord webhook:</strong> {String(diagnostics.environmentFlags?.hasDiscordWebhook)}</span>
                </div>
              ) : (
                <p style={{ color: '#aaa', marginTop: '0.6rem' }}>No diagnostics loaded yet.</p>
              )}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <h3 style={styles.sectionHeading}>Server Operations</h3>
              {operationsData ? (
                <>
                  <div style={styles.detailsContainer}>
                    {(operationsData.activeOperations || []).map((op) => (
                      <span key={op.op_name} style={styles.detailItem}>
                        <strong>{op.op_name}:</strong> {op.count} in last 5 min
                      </span>
                    ))}
                    {(operationsData.activeOperations || []).length === 0 && (
                      <span style={styles.detailItem}>No high activity in the last 5 minutes.</span>
                    )}
                  </div>

                  <div style={{ marginTop: '0.8rem', maxHeight: '280px', overflowY: 'auto' }}>
                    <ul style={styles.list}>
                      {(operationsData.recentOperations || []).slice(0, 40).map((op) => (
                        <li key={op.id} style={styles.listItem}>
                          <div>
                            <span style={styles.listName}>{op.op_name}</span>
                            <div style={styles.detailsContainer}>
                              <span style={styles.detailItem}><strong>When:</strong> {new Date(op.created_at).toLocaleString()}</span>
                              <span style={styles.detailItem}><strong>Status:</strong> {op.status || 'unknown'}</span>
                              <span style={styles.detailItem}><strong>Actor:</strong> {op.actor_type || 'n/a'} / {op.actor || 'n/a'}</span>
                              <span style={styles.detailItem}><strong>Target:</strong> {op.target || 'n/a'}</span>
                              <span style={styles.detailItem}><strong>Details:</strong> {op.details || 'n/a'}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p style={{ color: '#aaa', marginTop: '0.6rem' }}>No operations loaded yet.</p>
              )}
            </div>
          </div>
        )}
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
  secondaryBtn: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
  },
  tabBar: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginBottom: '1rem',
  },
  tabBtn: {
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.04)',
    color: '#ddd',
    cursor: 'pointer',
  },
  activeTabBtn: {
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid rgba(100,108,255,0.5)',
    background: 'rgba(100,108,255,0.25)',
    color: '#fff',
    cursor: 'pointer',
  },
  sectionCard: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '1rem',
    marginBottom: '1rem',
  },
  controlRow: {
    display: 'flex',
    gap: '0.6rem',
    flexWrap: 'wrap',
    marginBottom: '0.8rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '0.7rem',
  },
  statCard: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(0,0,0,0.22)',
    color: '#ddd',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.8rem',
    color: '#fff',
  },
  textArea: {
    width: '100%',
    minHeight: '90px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(0,0,0,0.2)',
    color: 'white',
    padding: '10px 12px',
    resize: 'vertical',
    marginBottom: '0.8rem',
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
  manualActionRow: {
    display: 'flex',
    gap: '0.6rem',
    marginTop: '0.8rem',
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
