import React from "react";
import { PHASE_COLORS } from "../constants/AppConstants";
import { styles } from "../styles/styles";

/**
 * Renders a confetti celebration overlay when the goal is 100% complete.
 */
export default function ConfettiCelebration() {
  return (
    <div style={styles.confettiOverlay}>
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${Math.random() * 100}%`,
            top: "-20px",
            width: 8 + Math.random() * 8,
            height: 8 + Math.random() * 8,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            background: PHASE_COLORS[i % 4],
            animation: `confettiDrop ${1.5 + Math.random() * 2}s ${Math.random() * 1}s ease-in forwards`,
          }}
        />
      ))}
      <div style={styles.confettiEmoji}>🎉</div>
    </div>
  );
}
