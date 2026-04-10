import React from "react";
import ProgressRing from "./ProgressRing";
import PhaseGroup from "./PhaseGroup";
import { styles } from "../styles/styles";

/**
 * Shows the active goal's progress card, progress bar, and phase list.
 * @param {Object} props
 * @param {string} props.goal - The current goal title
 * @param {string} props.quote - The motivational quote
 * @param {string[]} props.phaseOrder - Ordered list of phase names
 * @param {Object} props.phases - Map of phase name -> steps array
 * @param {number} props.totalDone - Total completed steps
 * @param {number} props.totalSteps - Total steps
 * @param {number} props.overallPct - Overall completion percentage
 * @param {number} props.activePhaseIndex - Index of the currently active phase
 * @param {Function} props.onToggle - Toggle a step's done state by id
 * @param {Function} props.onNote - Save a note for a step by id
 * @param {Function} props.onExport - Export plan as markdown
 * @param {Function} props.onReset - Reset/clear the current goal
 */
export default function ProgressSection({
  goal,
  quote,
  phaseOrder,
  phases,
  totalDone,
  totalSteps,
  overallPct,
  activePhaseIndex,
  onToggle,
  onNote,
  onExport,
  onReset,
}) {
  return (
    <div style={styles.progressSection}>
      <div style={styles.progressCard}>
        <div style={{ ...styles.progressHeader, marginBottom: quote ? 14 : 0 }}>
          <ProgressRing
            percent={overallPct}
            size={64}
            stroke={5}
            color={overallPct === 100 ? "#00C9A7" : "#C77DFF"}
          />
          <div style={styles.progressInfo}>
            <div style={styles.progressLabel}>Current Goal</div>
            <div style={styles.progressGoalTitle}>{goal}</div>
            <div style={styles.progressStepCount}>
              {totalDone} of {totalSteps} micro-steps complete
              {overallPct === 100 && " 🎉"}
            </div>
          </div>
          <div style={styles.progressActions}>
            <button onClick={onExport} style={styles.exportButton}>
              ↓ Export
            </button>
            <button onClick={onReset} style={styles.resetButton}>
              New Goal
            </button>
          </div>
        </div>
        {quote && (
          <div style={styles.quoteContainer}>"{quote}"</div>
        )}
      </div>

      <div style={styles.progressBarTrack}>
        <div style={styles.progressBarFill(overallPct)} />
      </div>

      {phaseOrder.map((phaseName, i) => (
        <PhaseGroup
          key={phaseName}
          phase={phaseName}
          phaseIndex={i}
          steps={phases[phaseName]}
          onToggle={onToggle}
          onNote={onNote}
          isActive={i === activePhaseIndex}
        />
      ))}
    </div>
  );
}
