export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer style={styles.footer}>
            {/* Gradient top separator */}
            <div style={styles.topLine} />

            <div style={styles.inner}>
                <div style={styles.topRow}>
                    <p style={styles.copy}>&copy; {year} Timo Ferendovych. All rights reserved.</p>
                    <div style={styles.socials}>
                        <a href="https://github.com/T1mohtml" target="_blank" rel="noopener noreferrer" style={styles.socialLink} title="GitHub">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                        </a>
                        <a href="mailto:timongogoyt@ferendovych.uk" style={styles.socialLink} title="Email">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                        </a>
                    </div>
                </div>

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
        padding: "0 1rem 2rem",
        position: "relative",
    },
    topLine: {
        height: "1px",
        background: "linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.5) 30%, rgba(165,243,252,0.4) 70%, transparent 100%)",
        marginBottom: "2rem",
    },
    inner: {
        maxWidth: "900px",
        margin: "0 auto",
        textAlign: "left",
    },
    topRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem",
        flexWrap: "wrap",
        gap: "0.75rem",
    },
    copy: {
        opacity: 0.4,
        margin: 0,
        fontSize: "0.88rem",
    },
    socials: {
        display: "flex",
        gap: "0.75rem",
        alignItems: "center",
    },
    socialLink: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        background: "rgba(124,58,237,0.08)",
        border: "1px solid rgba(124,58,237,0.18)",
        color: "#a78bfa",
        transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
        textDecoration: "none",
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