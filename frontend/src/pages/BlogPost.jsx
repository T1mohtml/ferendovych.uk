import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  "personal":   { bg: "rgba(124,58,237,0.14)",  color: "#c084fc" },
  "web dev":    { bg: "rgba(79,70,229,0.14)",   color: "#818cf8" },
  "react":      { bg: "rgba(6,182,212,0.12)",   color: "#67e8f9" },
  "cloudflare": { bg: "rgba(249,115,22,0.12)",  color: "#fdba74" },
  "climbing":   { bg: "rgba(16,185,129,0.12)",  color: "#6ee7b7" },
};
const defaultTag = { bg: "rgba(148,163,184,0.12)", color: "#94a3b8" };

function ContentBlock({ block }) {
  switch (block.type) {
    case "heading":
      return <h2 style={styles.contentHeading}>{block.text}</h2>;
    case "paragraph":
      return <p style={styles.contentParagraph}>{block.text}</p>;
    case "quote":
      return (
        <blockquote style={styles.contentQuote}>
          <span style={styles.contentQuoteBar} />
          <p style={styles.contentQuoteText}>{block.text}</p>
        </blockquote>
      );
    case "code":
      return (
        <div style={styles.codeWrapper}>
          {block.language && (
            <div style={styles.codeLang}>{block.language}</div>
          )}
          <pre style={styles.codePre}>
            <code style={styles.codeEl}>{block.text}</code>
          </pre>
        </div>
      );
    default:
      return null;
  }
}

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const idx = sorted.findIndex((p) => p.slug === slug);
  const post = sorted[idx];
  const prevPost = sorted[idx + 1] || null;
  const nextPost = sorted[idx - 1] || null;

  useEffect(() => {
    if (post) {
      document.title = `${post.title} — Timo`;
    }
    window.scrollTo(0, 0);
  }, [slug, post]);

  if (!post) {
    return (
      <div style={styles.notFound}>
        <span style={{ fontSize: "4rem" }}>📭</span>
        <h2 style={{ marginTop: "1rem" }}>Post not found</h2>
        <Link to="/blog" style={styles.backBtn}>← Back to blog</Link>
      </div>
    );
  }

  const rt = readingTime(post);

  return (
    <div style={styles.page}>
      {/* Background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <Link to="/blog" style={styles.backLink}>
          ← All posts
        </Link>
      </motion.div>

      {/* Header */}
      <motion.header
        style={styles.header}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div style={styles.coverEmoji}>{post.coverEmoji}</div>

        <div style={styles.metaRow}>
          {post.tags.map((tag) => {
            const tc = TAG_COLORS[tag] || defaultTag;
            return (
              <span key={tag} style={{ ...styles.tag, background: tc.bg, color: tc.color }}>
                {tag}
              </span>
            );
          })}
        </div>

        <h1 style={styles.title}>{post.title}</h1>

        <div style={styles.subMeta}>
          <span>📅 {formatDate(post.date)}</span>
          <span style={styles.dot}>·</span>
          <span>⏱ {rt} min read</span>
        </div>
      </motion.header>

      {/* Divider */}
      <motion.div
        style={styles.divider}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
      />

      {/* Content */}
      <motion.article
        style={styles.article}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
      >
        {post.content.map((block, i) => (
          <ContentBlock key={i} block={block} />
        ))}
      </motion.article>

      {/* Navigation between posts */}
      {(prevPost || nextPost) && (
        <motion.nav
          style={styles.postNav}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div style={styles.postNavDivider} />
          <div style={styles.postNavRow}>
            {prevPost ? (
              <Link to={`/blog/${prevPost.slug}`} style={{ ...styles.postNavLink, textAlign: "left" }}>
                <span style={styles.postNavLabel}>← Previous</span>
                <span style={styles.postNavTitle}>{prevPost.title}</span>
              </Link>
            ) : <div />}
            {nextPost ? (
              <Link to={`/blog/${nextPost.slug}`} style={{ ...styles.postNavLink, textAlign: "right" }}>
                <span style={styles.postNavLabel}>Next →</span>
                <span style={styles.postNavTitle}>{nextPost.title}</span>
              </Link>
            ) : <div />}
          </div>
        </motion.nav>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "120px 24px 80px",
    maxWidth: "720px",
    margin: "0 auto",
    position: "relative",
    boxSizing: "border-box",
  },
  orb1: {
    position: "fixed",
    top: "5%",
    left: "-20%",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 70%)",
    filter: "blur(70px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  orb2: {
    position: "fixed",
    bottom: "0%",
    right: "-15%",
    width: "440px",
    height: "440px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)",
    filter: "blur(70px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    fontSize: "0.88rem",
    fontWeight: 600,
    color: "#a78bfa",
    textDecoration: "none",
    marginBottom: "2.5rem",
    opacity: 0.8,
    transition: "opacity 0.15s",
  },
  header: {
    position: "relative",
    zIndex: 1,
    marginBottom: "2rem",
  },
  coverEmoji: {
    fontSize: "4rem",
    lineHeight: 1,
    marginBottom: "1.25rem",
    display: "block",
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.4rem",
    marginBottom: "1rem",
  },
  tag: {
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
    padding: "0.2rem 0.75rem",
    borderRadius: "20px",
    textTransform: "uppercase",
  },
  title: {
    fontSize: "clamp(2rem, 6vw, 3.2rem)",
    fontWeight: 900,
    letterSpacing: "-0.03em",
    lineHeight: 1.15,
    margin: "0 0 1rem",
    background: "linear-gradient(135deg, #f3f4f6 0%, #c4b5fd 50%, #818cf8 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subMeta: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.85rem",
    opacity: 0.45,
  },
  dot: { opacity: 0.5 },
  divider: {
    height: "1px",
    background: "linear-gradient(90deg, rgba(124,58,237,0.5), rgba(56,189,248,0.3), transparent)",
    marginBottom: "2.5rem",
    transformOrigin: "left",
    position: "relative",
    zIndex: 1,
  },
  article: {
    position: "relative",
    zIndex: 1,
  },
  contentHeading: {
    fontSize: "1.4rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    marginTop: "2.2rem",
    marginBottom: "0.75rem",
    background: "linear-gradient(135deg, #c4b5fd 0%, #818cf8 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  contentParagraph: {
    fontSize: "1.05rem",
    lineHeight: 1.8,
    opacity: 0.82,
    marginBottom: "1.2rem",
    marginTop: 0,
  },
  contentQuote: {
    margin: "1.8rem 0",
    padding: "0 0 0 1.4rem",
    position: "relative",
    display: "flex",
    gap: "1.2rem",
    alignItems: "flex-start",
  },
  contentQuoteBar: {
    display: "block",
    flexShrink: 0,
    width: "3px",
    alignSelf: "stretch",
    borderRadius: "2px",
    background: "linear-gradient(180deg, #7c3aed, #38bdf8)",
  },
  contentQuoteText: {
    fontSize: "1.15rem",
    fontStyle: "italic",
    lineHeight: 1.7,
    opacity: 0.75,
    margin: 0,
    flex: 1,
  },
  codeWrapper: {
    borderRadius: "14px",
    overflow: "hidden",
    margin: "1.5rem 0",
    border: "1px solid rgba(124,58,237,0.2)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
  },
  codeLang: {
    padding: "0.4rem 1rem",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    background: "rgba(124,58,237,0.15)",
    color: "#a78bfa",
    borderBottom: "1px solid rgba(124,58,237,0.15)",
  },
  codePre: {
    margin: 0,
    padding: "1.2rem 1.4rem",
    background: "rgba(15,3,40,0.6)",
    overflowX: "auto",
    backdropFilter: "blur(8px)",
  },
  codeEl: {
    fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
    fontSize: "0.88rem",
    lineHeight: 1.7,
    color: "#c4b5fd",
    whiteSpace: "pre",
  },
  postNav: {
    marginTop: "4rem",
    position: "relative",
    zIndex: 1,
  },
  postNavDivider: {
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)",
    marginBottom: "2rem",
  },
  postNavRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  postNavLink: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    padding: "1rem 1.2rem",
    borderRadius: "14px",
    background: "rgba(124,58,237,0.06)",
    border: "1px solid rgba(124,58,237,0.15)",
    textDecoration: "none",
    transition: "background 0.18s, border-color 0.18s",
  },
  postNavLabel: {
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: "#a78bfa",
    opacity: 0.7,
  },
  postNavTitle: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "inherit",
    opacity: 0.8,
    lineHeight: 1.4,
  },
  notFound: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    opacity: 0.6,
    textAlign: "center",
  },
  backBtn: {
    marginTop: "1rem",
    color: "#a78bfa",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
};
