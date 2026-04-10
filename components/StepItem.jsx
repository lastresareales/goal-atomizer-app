import React, { useState } from 'react';

export default function StepItem({ step, onToggle, onNote }) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState(step.note || "");
  const [animating, setAnimating] = useState(false);

  const handleCheck = () => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 500);
    onToggle(step.id);
  };

  const saveNote = () => {
    onNote(step.id, noteText);
    setNoteOpen(false);
  };

  return (
    <div
      style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "10px 14px", borderRadius: 10,
        background: step.done ? "rgba(0,201,167,0.07)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${step.done ? "rgba(0,201,167,0.25)" : "rgba(255,255,255,0.07)"}`,
        marginBottom: 6,
        transition: "all 0.3s ease",
        transform: animating ? "scale(0.98)" : "scale(1)",
        opacity: step.done ? 0.65 : 1,
      }}
    >
      <button
        onClick={handleCheck}
        style={{
          width: 22, height: 22, borderRadius: 6, border: `2px solid ${step.done ? "#00C9A7" : "rgba(255,255,255,0.2)"}`,
          background: step.done ? "#00C9A7" : "transparent",
          cursor: "pointer", flexShrink: 0, marginTop: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s ease",
        }}
      >
        {step.done && <span style={{ color: "#0a0a1a", fontSize: 13, fontWeight: 700 }}>✓</span>}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <p style={{
            margin: 0, fontSize: 14, lineHeight: 1.5,
            color: step.done ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.88)",
            textDecoration: step.done ? "line-through" : "none",
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.3s ease",
          }}>
            {step.text}
          </p>
          {step.time && (
             <span style={{ 
               fontSize: 10, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)",
               padding: "2px 6px", borderRadius: 4, fontWeight: 600, letterSpacing: 0.5
             }}>
               ⏱ {step.time}
             </span>
          )}
        </div>
        
        {step.note && (
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,183,71,0.7)", fontStyle: "italic" }}>
            📝 {step.note}
          </p>
        )}
        {noteOpen && (
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <input
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Add a note…"
              style={{
                flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 6, padding: "5px 10px", color: "#fff", fontSize: 13,
                fontFamily: "'DM Sans', sans-serif", outline: "none",
              }}
              onKeyDown={e => e.key === "Enter" && saveNote()}
            />
            <button onClick={saveNote} style={{ background: "#00C9A7", border: "none", borderRadius: 6, padding: "5px 10px", color: "#0a0a1a", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>Save</button>
          </div>
        )}
      </div>
      <button
        onClick={() => setNoteOpen(!noteOpen)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: 16, padding: "0 2px", flexShrink: 0, transition: "color 0.2s" }}
        onMouseEnter={e => e.target.style.color = "rgba(255,183,71,0.7)"}
        onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.25)"}
        title="Add note"
      >✎</button>
    </div>
  );
}
