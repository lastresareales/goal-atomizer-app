export const styles = {
  // Layout
  appContainer: {
    position: "relative",
    zIndex: 1,
    minHeight: "100vh",
    fontFamily: "'DM Sans', sans-serif",
    color: "#fff",
    padding: "0 16px 60px",
    maxWidth: 680,
    margin: "0 auto",
  },

  // Background gradient overlay
  backgroundGradient: {
    position: "fixed",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    background: `radial-gradient(ellipse 60% 40% at 20% 20%, rgba(0,201,167,0.08) 0%, transparent 60%),
                 radial-gradient(ellipse 50% 60% at 80% 80%, rgba(199,125,255,0.07) 0%, transparent 60%),
                 radial-gradient(ellipse 40% 50% at 50% 50%, rgba(255,107,107,0.04) 0%, transparent 70%)`,
  },

  // Header section
  headerSection: {
    textAlign: "center",
    paddingTop: 48,
    paddingBottom: 32,
  },
  headerBadge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 4,
    color: "#00C9A7",
    textTransform: "uppercase",
    fontFamily: "'Syne', sans-serif",
    marginBottom: 12,
    padding: "4px 14px",
    border: "1px solid rgba(0,201,167,0.3)",
    borderRadius: 100,
  },
  headerTitle: {
    fontSize: "clamp(28px, 6vw, 44px)",
    fontWeight: 800,
    fontFamily: "'Syne', sans-serif",
    lineHeight: 1.1,
    marginBottom: 10,
    background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.4)",
    fontWeight: 300,
  },

  // Provider / API key row
  providerRow: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  providerSelect: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "0 12px",
    color: "#fff",
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
  },
  apiKeyInput: {
    flex: 1,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "12px 16px",
    color: "#fff",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
  },

  // Goal input form
  inputCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 18,
    padding: 20,
    animation: "fadeSlideUp 0.5s ease",
  },
  textarea: {
    width: "100%",
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: 16,
    lineHeight: 1.6,
    resize: "none",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 300,
  },
  inputFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTop: "1px solid rgba(255,255,255,0.07)",
  },
  shortcutHint: {
    fontSize: 12,
    color: "rgba(255,255,255,0.2)",
  },
  submitButton: (loading) => ({
    background: loading ? "rgba(0,201,167,0.3)" : "linear-gradient(135deg, #00C9A7, #00a88a)",
    border: "none",
    borderRadius: 12,
    padding: "10px 24px",
    color: "#0a0a1a",
    fontWeight: 700,
    fontSize: 15,
    fontFamily: "'Syne', sans-serif",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
  }),

  // Loading state
  loadingContainer: {
    textAlign: "center",
    padding: "40px 0",
  },
  loadingEmoji: {
    fontSize: 32,
    animation: "float 1.5s ease-in-out infinite",
  },
  loadingText: {
    marginTop: 14,
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    animation: "pulse 1.5s ease-in-out infinite",
  },

  // Error display
  errorBox: {
    background: "rgba(255,107,107,0.1)",
    border: "1px solid rgba(255,107,107,0.3)",
    borderRadius: 12,
    padding: 14,
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: 16,
  },

  // Progress section
  progressSection: {
    animation: "fadeSlideUp 0.5s ease",
  },
  progressCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: "20px 20px 16px",
    marginBottom: 20,
  },
  progressHeader: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  progressInfo: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  progressGoalTitle: {
    fontSize: 17,
    fontWeight: 700,
    fontFamily: "'Syne', sans-serif",
    lineHeight: 1.3,
  },
  progressStepCount: {
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
    marginTop: 3,
  },
  progressActions: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  exportButton: {
    background: "rgba(0,201,167,0.15)",
    border: "1px solid rgba(0,201,167,0.3)",
    borderRadius: 8,
    padding: "6px 12px",
    color: "#00C9A7",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
  },
  resetButton: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "6px 12px",
    color: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
  },
  quoteContainer: {
    borderTop: "1px solid rgba(255,255,255,0.07)",
    paddingTop: 12,
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    fontStyle: "italic",
    lineHeight: 1.5,
  },

  // Progress bar
  progressBarTrack: {
    marginBottom: 20,
    height: 4,
    background: "rgba(255,255,255,0.07)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: (pct) => ({
    height: "100%",
    borderRadius: 4,
    background: "linear-gradient(90deg, #00C9A7, #C77DFF)",
    width: `${pct}%`,
    transition: "width 0.6s cubic-bezier(.4,2,.6,1)",
  }),

  // Confetti overlay
  confettiOverlay: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 999,
    overflow: "hidden",
  },
  confettiEmoji: {
    position: "absolute",
    top: "40%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    fontSize: 56,
    animation: "float 2s ease-in-out infinite",
  },
};
