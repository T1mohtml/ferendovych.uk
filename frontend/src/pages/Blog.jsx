import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import posts from "../data/blog.json";

function readingTime(post) {
  const words = post.content.reduce((acc, block) => {
    if (block.text) return acc + block.text.split(/\s+/).length;
    return acc;
  }, 0);
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const TAG_COLORS = {
  "personal":  { bg: "rgba(124,58,237,0.14)", color: "#c084fc" },
  "web dev":   { bg: "rgba(79,70,229,0.14)",  color: "#818cf8" },
  "react":     { bg: "rgba(6,182,212,0.12)",  color: "#67e8f9" },
  "cloudflare":{ bg: "rgba(249,115,22,0.12)", color: "#fdba74" },
  "climbing":  { bg: "rgba(16,185,129,0.12)", color: "#6ee7b7" },
};
const defaultTag = { bg: "rgba(148,163,184,0.12)", color: "#94a3b8" };

export default function Blog() {
  const [activeTag, setActiveTag] = useState(null);
  const allTags = [...new Set(posts.flatMap((p) => p.tags))];
  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const visible = activeTag ? sorted.filter((p) => p.tags.includes(activeTag)) : sorted;

  useEffect(() => {
    document.title = "Blog — Timo";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={styles.page}>
      {/* Background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      {/* Hero */}
      <motion.div
        style={styles.hero}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span style={styles.heroEyebrow}>✦ Thoughts & Adventures</span>
        <h1 style={styles.heroTitle}>My Blog</h1>
        <p style={styles.heroSub}>
          Writing about code, climbing, and whatever else is on my mind.
        </p>

        {/* Tag filter */}
        <div style={styles.tagFilter}>
          <motion.button
            style={{
              ...styles.tagBtn,
              ...(activeTag === null ? styles.tagBtnActive : {}),
            }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTag(null)}
          >
            All posts
          </motion.button>
          {allTags.map((tag) => {
            const tc = TAG_COLORS[tag] || defaultTag;
            const isActive = activeTag === tag;
            return (
              <motion.button
                key={tag}
                style={{
                  ...styles.tagBtn,
                  background: isActive ? tc.bg : "transparent",
                  color: isActive ? tc.color : "rgba(255,255,255,0.45)",
                  borderColor: isActive ? tc.color : "rgba(255,255,255,0.1)",
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTag(isActive ? null : tag)}
              >
                {tag}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Post count */}
      <div style={styles.countRow}>
        <span style={styles.countText}>
          {visible.length} post{visible.length !== 1 ? "s" : ""}
          {activeTag ? ` tagged "${activeTag}"` : ""}
        </span>
        <div style={styles.countLine} />
      </div>

      {/* Cards grid */}
      <motion.div style={styles.grid} layout>
        <AnimatePresence mode="popLayout">
          {visible.map((post, i) => {
            const rt = readingTime(post);
            return (
              <motion.div
                key={post.slug}
                layout
                initial={{ opacity: 0, y: 28, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
                transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <Link to={`/blog/${post.slug}`} style={styles.cardLink}>
                  <article style={styles.card}>
                    {/* Top accent line */}
                    <div style={styles.cardAccent} />

                    <div style={styles.cardInner}>
                      {/* Emoji cover */}
                      <div style={styles.cardEmoji}>{post.coverEmoji}</div>

                      {/* Tags */}
                      <div style={styles.cardTags}>
                        {post.tags.map((tag) => {
                          const tc = TAG_COLORS[tag] || defaultTag;
                          return (
                            <span
                              key={tag}
                              style={{
                                ...styles.tag,
                                background: tc.bg,
                                color: tc.color,
                              }}
                            >
                              {tag}
                            </span>
                          );
                        })}
                      </div>

                      <h2 style={styles.cardTitle}>{post.title}</h2>
                      <p style={styles.cardExcerpt}>{post.excerpt}</p>

                      <div style={styles.cardMeta}>
                        <span style={styles.metaDate}>📅 {formatDate(post.date)}</span>
                        <span style={styles.metaDot}>·</span>
                        <span style={styles.metaRead}>⏱ {rt} min read</span>
                      </div>

                      <div style={styles.cardCta}>
                        Read more <span style={styles.ctaArrow}>→</span>
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 && (
        <motion.div
          style={styles.empty}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span style={{ fontSize: "3rem" }}>🔍</span>
          <p>No posts with that tag yet.</p>
        </motion.div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "120px 24px 80px",
    maxWidth: "1100px",
    margin: "0 auto",
    position: "relative",
    boxSizing: "border-box",
  },
  orb1: {
    position: "fixed",
    top: "10%",
    left: "-15%",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
    filter: "blur(60px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  orb2: {
    position: "fixed",
    bottom: "5%",
    right: "-10%",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)",
    filter: "blur(60px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  hero: {
    textAlign: "center",
    marginBottom: "3rem",
    position: "relative",
    zIndex: 1,
  },
  heroEyebrow: {
    fontSize: "0.8rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#a78bfa",
    fontWeight: 600,
    display: "block",
    marginBottom: "0.75rem",
  },
  heroTitle: {
    fontSize: "clamp(3rem, 9vw, 5.5rem)",
    fontWeight: 900,
    letterSpacing: "-0.04em",
    lineHeight: 1.0,
    margin: "0 0 1rem",
    background: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 40%, #a78bfa 70%, #c4b5fd 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSub: {
    fontSize: "1.1rem",
    opacity: 0.55,
    margin: "0 0 2rem",
    maxWidth: "400px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  tagFilter: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    justifyContent: "center",
  },
  tagBtn: {
    padding: "0.4rem 1rem",
    borderRadius: "50px",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: "0.02em",
    transition: "all 0.18s",
  },
  tagBtnActive: {
    background: "rgba(124,58,237,0.2)",
    color: "#c4b5fd",
    borderColor: "#a78bfa",
    boxShadow: "0 0 12px rgba(124,58,237,0.25)",
  },
  countRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2rem",
    position: "relative",
    zIndex: 1,
  },
  countText: {
    fontSize: "0.82rem",
    opacity: 0.4,
    whiteSpace: "nowrap",
    fontWeight: 500,
  },
  countLine: {
    flex: 1,
    height: "1px",
    background: "linear-gradient(90deg, rgba(124,58,237,0.3), transparent)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "1.5rem",
    position: "relative",
    zIndex: 1,
  },
  cardLink: {
    textDecoration: "none",
    color: "inherit",
    display: "block",
    height: "100%",
  },
  card: {
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(124,58,237,0.16)",
    borderRadius: "20px",
    overflow: "hidden",
    height: "100%",
    boxShadow: "0 4px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.05)",
    transition: "border-color 0.2s, box-shadow 0.2s",
    backdropFilter: "blur(12px)",
  },
  cardAccent: {
    height: "3px",
    background: "linear-gradient(90deg, #7c3aed, #818cf8, #38bdf8)",
  },
  cardInner: {
    padding: "1.6rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
  },
  cardEmoji: {
    fontSize: "2.4rem",
    lineHeight: 1,
    marginBottom: "0.25rem",
  },
  cardTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.4rem",
  },
  tag: {
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    padding: "0.2rem 0.7rem",
    borderRadius: "20px",
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: "1.2rem",
    fontWeight: 800,
    lineHeight: 1.3,
    letterSpacing: "-0.02em",
    margin: "0.1rem 0 0",
    color: "inherit",
  },
  cardExcerpt: {
    fontSize: "0.9rem",
    lineHeight: 1.65,
    opacity: 0.6,
    margin: 0,
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.78rem",
    opacity: 0.45,
    marginTop: "0.25rem",
  },
  metaDate: { whiteSpace: "nowrap" },
  metaDot: { opacity: 0.5 },
  metaRead: { whiteSpace: "nowrap" },
  cardCta: {
    marginTop: "0.75rem",
    fontSize: "0.88rem",
    fontWeight: 700,
    color: "#a78bfa",
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
  },
  ctaArrow: {
    display: "inline-block",
    transition: "transform 0.15s",
  },
  empty: {
    textAlign: "center",
    padding: "5rem 1rem",
    opacity: 0.5,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    position: "relative",
    zIndex: 1,
  },
};
