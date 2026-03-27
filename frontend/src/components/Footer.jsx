export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer style={styles.footer}>
            <div style={styles.inner}>
                <p style={styles.copy}>&copy; {year} Timo Ferendovych. All rights reserved.</p>

                <div styles={styles.trustBlock}>
                    <h4 style={styles.trustTitle}>Trust & Safety</h4>
                    <ul style={styles.trustList}>
                        <li>HTTPS Secured</li>
                        <li>Anti-spam & abuse protection active</li>
                        <li>Active moderation for harmful submissions</li>
                        <li>Minimal data used for security operations</li>
                    </ul>
                    <a href="/privacy" style={styles.privacyLink}>Privacy Policy</a>
                </div>
            </div>
        </footer>
    );
}

const styles = {
    footer: {
        marginTop: "3rem",
        padding: "rem 1rem",
        borderTop: "1px solid rgba(255,255,255,0.12)",

    },
    inner: {
        maxWidth: "900px",
        margin: "0 auto",
        textAlign: "left",
    },
    copy: {
        opacity: 0.7,
        marginBottom: "1.5rem",
    },
    trustBlock: {
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "12px",
        padding: "1rem",
    },
    trustTitle: {
        margin: "0 0 0.6rem 0",
    },
    trustList: {
        margin: 0,
        paddingLeft: "1.2rem",
        lineHeight: 1.6,
    },
    privacyLink: {
        display: "inline-block",
        marginTop: "0.8rem",
        color: "#8ea2ff",
        textDecoration: "none",
        fontWeight: 600,
    },
};