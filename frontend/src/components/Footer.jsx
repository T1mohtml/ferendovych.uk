export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer style={styles.footer}>
            <div style={styles.inner}>
                <p style={styles.copy}>&copy; {year} Timo Ferendovych. All rights reserved.</p>

                <div style={styles.trustBlock}>
                    <h4 style={styles.trustTitle}>
                        <span style={styles.trustTitleGradient}>Trust & Safety</span> 🛡️
                    </h4>
                    <ul style={styles.trustList}>
                        <li>HTTPS Secured</li>
                        <li>Anti-spam & abuse protection active</li>
                        <li>Active moderation for harmful submissions</li>
                        <li>Minimal data used for security operations</li>
                    </ul>
                    <a href="/privacy" style={styles.privacyLink}>Privacy Policy →</a>
                </div>
            </div>
        </footer>
    );
}

const styles = {
    footer: {
        marginTop: "3rem",
        padding: "2rem 1rem",
        borderTop: "1px solid rgba(255,255,255,0.08)",
    },
    inner: {
        maxWidth: "900px",
        margin: "0 auto",
        textAlign: "left",
    },
    copy: {
        opacity: 0.4,
        marginBottom: "1.5rem",
        fontSize: "0.88rem",
    },
    trustBlock: {
        background: "rgba(124,58,237,0.05)",
        border: "1px solid rgba(124,58,237,0.18)",
        borderRadius: "14px",
        padding: "1.2rem 1.4rem",
    },
    trustTitle: {
        margin: "0 0 0.7rem 0",
        fontSize: "0.95rem",
        fontWeight: 700,
    },
    trustTitleGradient: {
        background: "linear-gradient(135deg, #c4b5fd 0%, #818cf8 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },
    trustList: {
        margin: 0,
        paddingLeft: "1.2rem",
        lineHeight: 1.8,
        opacity: 0.65,
        fontSize: "0.88rem",
    },
    privacyLink: {
        display: "inline-block",
        marginTop: "0.9rem",
        color: "#a78bfa",
        textDecoration: "none",
        fontWeight: 600,
        fontSize: "0.88rem",
        transition: "color 0.2s",
    },
};