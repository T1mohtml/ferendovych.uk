import { useEffect, useMemo, useState } from 'react';

const photoModules = import.meta.glob('../../public/photos/*.{jpg,jpeg,png,webp,gif}', {
  eager: true,
  import: 'default',
});

const buildPhotoList = () =>
  Object.entries(photoModules)
    .map(([path, imageUrl]) => {
      const fileName = path.split('/').pop() || 'photo';
      const title = fileName.replace(/\.[^.]+$/, '');

      return {
        id: path,
        title: title.replace(/[-_]+/g, ' '),
        caption: '',
        imageUrl,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));

export default function Photography() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    try {
      setPhotos(buildPhotoList());
    } catch (err) {
      setError(err.message || 'Unable to load photos');
    } finally {
      setLoading(false);
    }
  }, []);

  const photoCountLabel = useMemo(() => {
    if (photos.length === 0) return 'No photos yet';
    if (photos.length === 1) return '1 photo';
    return `${photos.length} photos`;
  }, [photos.length]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>Photography</p>
        <h1 style={styles.title}>Moments from my lens</h1>
        <p style={styles.subtitle}>Drop photos into the public photos folder and they will appear here automatically.</p>
        <p style={styles.count}>{photoCountLabel}</p>
      </div>

      {loading && <p style={styles.state}>Loading photos…</p>}
      {error && <p style={styles.state}>{error}</p>}

      {!loading && !error && photos.length === 0 && (
        <p style={styles.state}>No photos yet. Add images to the public photos folder.</p>
      )}

      <div style={styles.grid}>
        {photos.map((photo) => (
          <article key={photo.id} style={styles.card}>
            <button type="button" style={styles.imageButton} onClick={() => setSelectedPhoto(photo)}>
              <img src={photo.imageUrl} alt={photo.title || 'Photography'} style={styles.image} />
            </button>
            <div style={styles.cardBody}>
              <h2 style={styles.photoTitle}>{photo.title || 'Untitled photo'}</h2>
              {photo.caption ? <p style={styles.caption}>{photo.caption}</p> : null}
            </div>
          </article>
        ))}
      </div>

      {selectedPhoto && (
        <div style={styles.modalOverlay} onClick={() => setSelectedPhoto(null)}>
          <div style={styles.modalContent} onClick={(event) => event.stopPropagation()}>
            <button type="button" style={styles.closeButton} onClick={() => setSelectedPhoto(null)} aria-label="Close photo">
              ×
            </button>
            <img src={selectedPhoto.imageUrl} alt={selectedPhoto.title || 'Photography'} style={styles.modalImage} />
            <div style={styles.modalBody}>
              <h3 style={styles.modalTitle}>{selectedPhoto.title || 'Untitled photo'}</h3>
              {selectedPhoto.caption ? <p style={styles.modalCaption}>{selectedPhoto.caption}</p> : null}
            </div>
          </div>
        </div>
      )}
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
  count: {
    margin: '0.7rem 0 0',
    color: '#c4b5fd',
    fontSize: '0.95rem',
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
    transition: 'transform 180ms ease, border-color 180ms ease',
  },
  imageButton: {
    padding: 0,
    border: 0,
    background: 'transparent',
    cursor: 'pointer',
    width: '100%',
  },
  image: {
    width: '100%',
    height: '280px',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 220ms ease',
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
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 1000,
  },
  modalContent: {
    position: 'relative',
    width: '100%',
    maxWidth: '900px',
    background: 'rgba(10,10,10,0.95)',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  closeButton: {
    position: 'absolute',
    top: '0.8rem',
    right: '0.8rem',
    border: 'none',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    width: '2.2rem',
    height: '2.2rem',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    zIndex: 1,
  },
  modalImage: {
    display: 'block',
    width: '100%',
    maxHeight: '70vh',
    objectFit: 'contain',
    background: '#000',
  },
  modalBody: {
    padding: '1rem 1.2rem 1.2rem',
  },
  modalTitle: {
    margin: '0 0 0.3rem',
    color: '#fff',
    fontSize: '1.1rem',
  },
  modalCaption: {
    margin: 0,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 1.6,
  },
};
