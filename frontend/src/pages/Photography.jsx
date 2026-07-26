import { useEffect, useState } from 'react';

export default function Photography() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const response = await fetch('/api/photography');
        if (!response.ok) {
          throw new Error('Unable to load photos');
        }
        const data = await response.json();
        setPhotos(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Unable to load photos');
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>Photography</p>
        <h1 style={styles.title}>Moments from my lens</h1>
        <p style={styles.subtitle}>Upload new shots from the admin panel and they will appear here automatically.</p>
      </div>

      {loading && <p style={styles.state}>Loading photos…</p>}
      {error && <p style={styles.state}>{error}</p>}

      {!loading && !error && photos.length === 0 && (
        <p style={styles.state}>No photos yet. Add the first one from the admin page.</p>
      )}

      <div style={styles.grid}>
        {photos.map((photo) => (
          <article key={photo.id} style={styles.card}>
            <img src={photo.imageData} alt={photo.title || 'Photography'} style={styles.image} />
            <div style={styles.cardBody}>
              <h2 style={styles.photoTitle}>{photo.title || 'Untitled photo'}</h2>
              {photo.caption ? <p style={styles.caption}>{photo.caption}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    padding: '7rem 1.25rem 3rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  eyebrow: {
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    fontSize: '0.8rem',
    color: '#8b5cf6',
  },
  title: {
    margin: '0.35rem 0 0.5rem',
    fontSize: '2rem',
    color: '#fff',
  },
  subtitle: {
    margin: 0,
    color: 'rgba(255,255,255,0.72)',
    maxWidth: '720px',
    lineHeight: 1.6,
  },
  state: {
    color: 'rgba(255,255,255,0.72)',
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.25rem',
  },
  card: {
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
  },
  image: {
    width: '100%',
    height: '280px',
    objectFit: 'cover',
    display: 'block',
  },
  cardBody: {
    padding: '1rem',
  },
  photoTitle: {
    margin: '0 0 0.4rem',
    color: '#fff',
    fontSize: '1.05rem',
  },
  caption: {
    margin: 0,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.6,
  },
};
