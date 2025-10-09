
import React, { useEffect, useRef } from "react"; // Import react stuff
// Example: import an image from the src tree (bundled by the build)
// assets live in src/assets; from src/pages the relative path is ../assets
import FirstClimb from "../assets/FirstClimb.jpeg";
import FirstLead from "../assets/FirstLead.jpeg";
import Boulder from "../assets/Boulder.mp4";
import LoopIcon from "../assets/loop.svg";
import { motion, useScroll, useTransform } from "framer-motion"; // import framer motion for animations

// Small helper component: autoplay muted video when at least 50% in view, pause otherwise
function AutoPlayVideo({ src, poster, className, style }) {
  const ref = React.useRef(null);
  const [muted, setMuted] = React.useState(true);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.muted = muted;
    el.playsInline = true;
    // do not preload full video to save bandwidth; we'll load on intersect
    el.preload = 'metadata';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // when near viewport (20%), lazy-load the source
          if (!loaded && entry.isIntersecting && entry.intersectionRatio >= 0.2) {
            el.src = src;
            try { el.load(); } catch (e) {}
            setLoaded(true);
          }

          // play when at least 50% visible, pause otherwise
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            try {
              el.play().catch(() => {
                // ensure muted then retry
                el.muted = true;
                el.play().catch(() => {});
              });
            } catch (e) {}
          } else {
            try { el.pause(); } catch (e) {}
          }
        });
      },
      { threshold: [0.2, 0.5] }
    );

    observer.observe(el);

    // show a loop overlay briefly when video ends or reaches the end (robust)
    let loopTimeout = null;
    let lastShown = 0;
    const showOverlay = () => {
      const container = el.parentElement;
      const overlay = container?.querySelector('[data-loop-overlay]');
      if (overlay) {
        overlay.style.opacity = '1';
        clearTimeout(loopTimeout);
        loopTimeout = setTimeout(() => { overlay.style.opacity = '0'; }, 900);
      }
    };

    const onEnded = () => {
      showOverlay();
    };

    const onTime = () => {
      if (!el.duration || !isFinite(el.duration)) return;
      // if within 120ms of the end and we haven't shown recently, flash overlay
      if (el.currentTime >= el.duration - 0.12) {
        const now = Date.now();
        if (now - lastShown > 900) {
          lastShown = now;
          showOverlay();
        }
      }
    };

    el.addEventListener('ended', onEnded);
    el.addEventListener('timeupdate', onTime);

    return () => {
      observer.disconnect();
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('timeupdate', onTime);
      clearTimeout(loopTimeout);
      try { el.pause(); } catch (e) {}
    };
  }, [src, loaded, muted]);

  // toggle mute state
  const toggleMute = () => {
    const el = ref.current;
    if (!el) return;
    const next = !muted;
    setMuted(next);
    try { el.muted = next; } catch (e) {}
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }} className={className}>
      <video
        ref={ref}
        poster={poster}
        muted={muted}
        loop
        playsInline
        style={{ width: '100%', height: '100%', display: 'block', ...(style || {}) }}
      />

      {/* gradient overlay for better text/contrast */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '40%',
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)',
        pointerEvents: 'none'
      }} />

      {/* loop overlay (hidden by default) */}
      <div data-loop-overlay style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 6,
        opacity: 0,
        transition: 'opacity 180ms ease'
      }}>
        <img src={LoopIcon} alt="loop" style={{ width: '48px', height: '48px' }} />
      </div>

      {/* mute/unmute button */}
      <button
        onClick={toggleMute}
        aria-label={muted ? 'Unmute video' : 'Mute video'}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          zIndex: 5,
          background: 'rgba(0,0,0,0.5)',
          border: 'none',
          color: 'white',
          padding: '6px 8px',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}

// Climbing adventures data

export default function Climbing() { // export stuff (idk what this does lol)
  const containerRef = useRef(null);
  
  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"] // why 2 start starts and ends? no idea
  });

  // Transform scroll progress to different values - these will reverse automatically
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100]); // hero? reminds me of Super man
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const cardsY = useTransform(scrollYProgress, [0.2, 0.6], [50, -50]); // cards? like credit cards?
  const cardsOpacity = useTransform(scrollYProgress, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0]);

  // Set dynamic page title and force scroll to top
  useEffect(() => { // ohh I see what this does
    document.title = "Climbing Adventures - Timo"; // titleeee
    // Force scroll to absolute top of page
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return ( // return? mkay *goes home to sleep*
    <div ref={containerRef}> {/* dude why does this comment have to be in curly braces? */} {/* thats weaird */}
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          ...styles.heroSection, // spread operator, nice
          y: heroY, // SPIDER MAN SPIDER MAN IM GONNA HIT YOU WITH A FRYING PAN
          opacity: heroOpacity,
        }}
        transition={{ 
          duration: 1.0, 
          ease: [0.6, -0.05, 0.01, 0.99]
        }}
      >
        <div style={styles.heroContent}> {/* tbh im not sure what this does, smth with heroes ig */}
                    <motion.h1 /* h1? like in html? *(mind blown)* */
            style={styles.heroTitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.2,
              ease: "easeOut" /* Okay *Fades out of existence* */
            }}
          >
            🧗‍♂️ Climbing Adventures {/* Ayy finally smth i understand something!!11!1! smh */}
          </motion.h1> {/* h1 end */}
          <motion.p 
            style={styles.heroText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.5,
              ease: "easeOut"
            }}
          >
            Exploring vertical worlds, one route at a time
          </motion.p>
          
          {/* Scroll Down Indicator */}
          <motion.div
            style={styles.scrollIndicator}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 1.2,
              ease: "easeOut"
            }}
            onClick={() => {
              const adventuresSection = document.querySelector('[data-section="adventures"]');
              if (adventuresSection) {
                adventuresSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={styles.scrollArrow}
            >
              ⬇️
            </motion.div>
            <p style={styles.scrollText}>Scroll to see adventures</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Adventures Gallery Section */}
      <motion.section
        data-section="adventures"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1 }}
        style={styles.adventuresSection}
      >
        <div style={styles.container}>
          <motion.h2 
            style={styles.sectionTitle}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Recent Adventures
          </motion.h2>

          <div style={styles.adventuresGrid}>
            {climbingAdventures.map((adventure, index) => (
              <motion.div
                key={adventure.id}
                style={{
                  ...styles.adventureCard,
                  y: cardsY,
                  opacity: cardsOpacity,
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ 
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                  transition: { duration: 0.2 }
                }}
                animate={{
                  scale: 1,
                  boxShadow: "none",
                  transition: { duration: 0 } // INSTANT return
                }}
              >
                {/* If a video is provided, render it; otherwise render the image */}
                {adventure.video ? (
                  <div style={styles.adventureImageWrapper}>
                    <AutoPlayVideo
                      src={adventure.video}
                      poster={adventure.poster || adventure.image || '/vite.svg'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div style={styles.adventureImageWrapper}>
                    <img
                      src={adventure.image || '/vite.svg'}
                      alt={adventure.title}
                      style={styles.adventureImage}
                    />
                  </div>
                )}

                <div style={styles.adventureContent}>
                  <div style={styles.adventureHeader}>
                    <h3 style={styles.adventureTitle}>{adventure.title}</h3>
                    <div style={styles.adventureGrade}>{adventure.grade}</div>
                  </div>
                  <p style={styles.adventureLocation}>📍 {adventure.location}</p>
                  <p style={styles.adventureDescription}>{adventure.description}</p>
                  
                  <div style={styles.adventureMeta}>
                    <span style={styles.adventureDate}>{adventure.date}</span>
                    <span style={styles.adventureType}>{adventure.type}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        style={styles.statsSection}
      >
        <div style={styles.container}>
          <motion.h2 
            style={styles.sectionTitle}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Climbing Stats
          </motion.h2>

          <div style={styles.statsGrid}>
            {climbingStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                style={styles.statCard}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1 + 0.3,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.15 }
                }}
                animate={{
                  scale: 1,
                  y: 0,
                  transition: { duration: 0 } // INSTANT return (coolcat style)
                }}
              >
                <div style={styles.statIcon}>{stat.icon}</div>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}

// Sample climbing adventures data
const climbingAdventures = [
  {
    id: 1,
    title: "Næstved Klatre Klub (NKL) boulder",
    location: "Næstved, Sjælland, Denmark",
    grade: "5A (boulder scale)",
    type: "Bouldering",
    date: "Sep 2025",
    // example: place images in public/images/climbing/ and reference them like '/images/climbing/naestved-boulder.jpg'
  image: FirstClimb,
  // use imported Boulder mp4 as video src (bundled by Vite)
  video: Boulder,
  poster: FirstClimb,
    description: "Finally got to to the top before it started to be a leading route. It was also my first route before i found some of the easier ones."
  },
  {
    id: 2,
    title: "Næstved Klatre Klub (NKL) lead",
    location: "Næstved, Sjælland, Denmark",
    grade: "4a",
    type: "Lead Climbing",
    date: "Sep 2025",
    image: FirstLead,
    description: "Finally got permission to lead climb at NKL. Felt great to clip the quickdraws and manage the rope. hit my head once when the rope came down! overall a great experience."
  },
  {
    id: 3,
    title: "Næstved Klatre Klub (NKL) Top Rope",
    location: "Næstved, Sjælland, Denmark",
    grade: "4a (i think)",
    type: "Top Rope climbing",
    date: "Jun 2025",
    image: FirstClimb,
    description: "My first time climbing at NKL. First time got to about half the route before getting scared. Second time I managed to top it out and get to the top."
  }
];

// Climbing statistics
const climbingStats = [
  { icon: "🎯", value: "15+", label: "Routes Climbed" },
  { icon: "⛰️", value: "2", label: "Locations Visited" },
  { icon: "📈", value: "6b", label: "Hardest Grade" },
];

const styles = {
  heroSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: "100vh",
    width: "100%",
    textAlign: "center",
    padding: "0 2rem 2rem 2rem",
    paddingTop: "120px", // Extra space for navbar + buffer
    margin: "0",
    marginTop: "0",
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(135deg, rgba(100, 108, 255, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%)",
    boxSizing: "border-box",
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
  },
  heroTitle: {
    fontSize: "clamp(2rem, 8vw, 4rem)",
    margin: "0 0 1rem 0",
    fontWeight: "700",
    background: "linear-gradient(135deg, #646cff, #ff6b6b)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroText: {
    fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
    margin: "0",
    opacity: 0.8,
  },
  adventuresSection: {
    minHeight: "100vh",
    width: "100%",
    padding: "4rem 2rem",
    margin: "0",
    backgroundColor: "inherit",
    boxSizing: "border-box",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: "clamp(2rem, 6vw, 3rem)",
    textAlign: "center",
    marginBottom: "3rem",
    color: "inherit",
  },
  adventuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "2rem",
    marginBottom: "4rem",
  },
  adventureCard: {
    backgroundColor: "rgba(100, 108, 255, 0.05)",
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid rgba(100, 108, 255, 0.1)",
    cursor: "pointer",
    transition: "all 0.1s ease",
  },
  adventureGrade: {
    backgroundColor: "#646cff",
    color: "white",
    padding: "0.4rem 1rem",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
    whiteSpace: "nowrap",
    marginLeft: "1rem",
  },
  adventureContent: {
    padding: "2rem",
  },
  adventureHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  adventureTitle: {
    fontSize: "1.3rem",
    fontWeight: "600",
    margin: "0",
    color: "inherit",
    flex: "1",
  },
  adventureLocation: {
    fontSize: "0.9rem",
    color: "inherit",
    opacity: 0.7,
    marginBottom: "1rem",
  },
  adventureDescription: {
    fontSize: "0.95rem",
    lineHeight: "1.5",
    color: "inherit",
    opacity: 0.8,
    marginBottom: "1rem",
  },
  adventureMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  adventureDate: {
    fontSize: "0.85rem",
    color: "inherit",
    opacity: 0.6,
  },
  adventureType: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    color: "#ff6b6b",
    padding: "0.2rem 0.6rem",
    borderRadius: "10px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  statsSection: {
    minHeight: "50vh",
    width: "100%",
    padding: "4rem 2rem",
    margin: "0",
    backgroundColor: "inherit",
    boxSizing: "border-box",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "2rem",
  },
  statCard: {
    textAlign: "center",
    padding: "2rem 1rem",
    borderRadius: "15px",
    backgroundColor: "rgba(100, 108, 255, 0.05)",
    border: "1px solid rgba(100, 108, 255, 0.1)",
    cursor: "pointer",
  },
  statIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#646cff",
    marginBottom: "0.5rem",
  },
  statLabel: {
    fontSize: "1rem",
    color: "inherit",
    opacity: 0.7,
  },
  scrollIndicator: {
    position: "relative",
    marginTop: "2rem",
    textAlign: "center",
    cursor: "pointer",
    zIndex: 3,
  },
  scrollArrow: {
    fontSize: "2rem",
    marginBottom: "0.5rem",
    display: "block",
  },
  scrollText: {
    fontSize: "0.9rem",
    opacity: 0.7,
    margin: "0",
    color: "inherit",
  },
  adventureImageWrapper: {
    width: '100%',
    height: '220px',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.03)'
  },
  adventureImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 220ms ease'
  }
};