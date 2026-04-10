import React, { useCallback } from "react";
import { styles } from "../styles/styles";

/**
 * The goal input form shown before a goal has been atomized.
 * @param {Object} props
 * @param {string} props.inputVal - Current text in the textarea
 * @param {Function} props.onInputChange - Called with new input value
 * @param {Function} props.onSubmit - Called when user submits the goal
 * @param {boolean} props.loading - Whether a request is in progress
 * @param {React.Ref} props.inputRef - Ref attached to the textarea
 */
export default function GoalInputForm({ inputVal, onInputChange, onSubmit, loading, inputRef }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && e.metaKey) onSubmit();
    },
    [onSubmit]
  );

  return (
    <div style={styles.inputCard}>
      <textarea
        ref={inputRef}
        value={inputVal}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={
          "What's your goal? Be specific or broad — I'll handle it.\n\ne.g. 'Build a Solana Trading Bot in Node.js'"
        }
        rows={4}
        onKeyDown={handleKeyDown}
        style={styles.textarea}
      />
      <div style={styles.inputFooter}>
        <span style={styles.shortcutHint}>⌘↵ to submit</span>
        <button
          onClick={onSubmit}
          disabled={loading || !inputVal.trim()}
          style={styles.submitButton(loading)}
        >
          {loading ? "Atomizing…" : "Atomize Goal →"}
        </button>
      </div>
    </div>
  );
}
