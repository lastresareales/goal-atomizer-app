import React from "react";
import { styles } from "../styles/styles";

/**
 * Displays a loading animation while the AI is processing.
 * @param {Object} props
 * @param {string} props.providerName - Display name of the active AI provider
 */
export default function LoadingState({ providerName }) {
  return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingEmoji}>⚛️</div>
      <p style={styles.loadingText}>
        Routing via {providerName.split(" ")[0]}...
      </p>
    </div>
  );
}
