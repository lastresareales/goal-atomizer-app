import React, { useState } from "react";
import StepItem from "./StepItem";
import { PHASE_COLORS } from "../constants/AppConstants";

/**
 * Renders a single phase group with its header and list of steps.
 * @param {Object} props
 * @param {string} props.phase - Phase name
 * @param {number} props.phaseIndex - Index of this phase (0-based)
 * @param {Array} props.steps - Array of step objects
 * @param {Function} props.onToggle - Toggle a step's done state
 * @param {Function} props.onNote - Save a note for a step
 * @param {boolean} props.isActive - Whether this is the currently active phase
 */
export default function PhaseGroup({ phase, phaseIndex, steps = [], onToggle, onNote, isActive }) {
  const [collapsed, setCollapsed] = useState(false);

  const color = PHASE_COLORS[phaseIndex % PHASE_COLORS.length];
  const doneCount = steps.filter((s) => s.done).length;
  const totalCount = steps.length;
  const phasePct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div
      style={{
        marginBottom: 12,
        borderRadius: 14,
        border: isActive
          ? `1px solid ${color}40`
          : "1px solid rgba(255,255,255,0.06)",
        background: isActive ? `${color}08` : "rgba(255,255,255,0.02)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Phase header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
            boxShadow: isActive ? `0 0 8px ${color}` : "none",
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Syne', sans-serif",
              color: isActive ? color : "rgba(255,255,255,0.7)",
              letterSpacing: 0.5,
            }}
          >
            Phase {phaseIndex + 1}: {phase}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>
            {doneCount}/{totalCount} steps · {phasePct}%
          </div>
        </div>
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
          {collapsed ? "▶" : "▼"}
        </span>
      </button>

      {/* Steps list */}
      {!collapsed && (
        <div style={{ padding: "0 12px 12px" }}>
          {steps.map((step) => (
            <StepItem key={step.id} step={step} onToggle={onToggle} onNote={onNote} />
          ))}
        </div>
      )}
    </div>
  );
}
