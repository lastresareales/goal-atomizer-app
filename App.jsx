import React, { useState, useEffect, useRef } from "react";
import PhaseGroup from "./components/PhaseGroup";
import ProgressRing from "./components/ProgressRing";
import { PHASES, PHASE_COLORS, PROVIDERS } from "./constants/appConstants";
import "./index.css";

export default function App() {
  // Load initial state from LocalStorage
  const loadState = (key, fallback) => {
    try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : fallback; } 
    catch { return fallback; }
  };

  const [provider, setProvider] = useState(() => loadState("ga_provider", "anthropic"));
  const [apiKey, setApiKey] = useState(() => loadState("ga_apikey", ""));
  const [goal, setGoal] = useState(() => loadState("ga_goal", ""));
  const [inputVal, setInputVal] = useState("");
  const [phases, setPhases] = useState(() => loadState("ga_phases", {}));
  const [phaseOrder, setPhaseOrder] = useState(() => loadState("ga_phaseOrder", []));
  const [quote, setQuote] = useState(() => loadState("ga_quote", ""));
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confetti, setConfetti] = useState(false);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const inputRef = useRef(null);

  const allSteps = phaseOrder.flatMap(p => phases[p] || []);
  const totalDone = allSteps.filter(s => s.done).length;
  const totalSteps = allSteps.length;
  const overallPct = totalSteps > 0 ? Math.round((totalDone / totalSteps) * 100) : 0;

  // Persist State to LocalStorage
  useEffect(() => { localStorage.setItem("ga_provider", JSON.stringify(provider)); }, [provider]);
  useEffect(() => { localStorage.setItem("ga_apikey", JSON.stringify(apiKey)); }, [apiKey]);
  useEffect(() => {
    localStorage.setItem("ga_goal", JSON.stringify(goal));
    localStorage.setItem("ga_phases", JSON.stringify(phases));
    localStorage.setItem("ga_phaseOrder", JSON.stringify(phaseOrder));
    localStorage.setItem("ga_quote", JSON.stringify(quote));
  }, [goal, phases, phaseOrder, quote]);

  useEffect(() => {
    if (overallPct === 100 && totalSteps > 0) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 4000);
    }
    for (let i = 0; i < phaseOrder.length; i++) {
      const ph = phases[phaseOrder[i]] || [];
      if (ph.some(s => !s.done)) { setActivePhaseIndex(i); return; }
    }
    setActivePhaseIndex(phaseOrder.length > 0 ? phaseOrder.length - 1 : 0);
  }, [totalDone, phaseOrder, phases, overallPct, totalSteps]);

  const exportMarkdown = () => {
    let md = `# Goal: ${goal}\n> *${quote}*\n\n`;
    phaseOrder.forEach((phaseName, i) => {
      md += `## Phase ${i + 1}: ${phaseName}\n`;
      phases[phaseName].forEach(step => {
        md += `- [${step.done ? 'x' : ' '}] ${step.text} *(⏱ ${step.time})*\n`;
        if (step.note) md += `  - *Note: ${step.note}*\n`;
      });
      md += `\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Goal_Plan_${goal.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const breakdownGoal = async () => {
    if (!inputVal.trim()) return;
    if (!apiKey.trim()) { setError(`Please enter your ${PROVIDERS.find(p => p.id === provider).name} API key.`); return; }
    
    setLoading(true); setError(""); setPhases({}); setPhaseOrder([]); setQuote("");

    const systemPrompt = `You are a world-class goal-achievement strategist. Break the user's goal into the SMALLEST possible atomic micro-steps, grouped into 4 phases. 

IMPORTANT: Respond ONLY with valid JSON. No markdown, no backticks.
The JSON structure must exactly match:
{
  "goal_title": "Cleaned up goal title",
  "phases": [
    {
      "name": "Phase name (e.g. Foundation, Momentum)",
      "steps": [
        {
          "action": "Ultra-specific micro-step (max 12 words, starts with verb)",
          "time": "Time estimate (e.g. '5m', '15m')"
        }
      ]
    }
  ],
  "motivational_quote": "Short punchy quote under 15 words"
}
Rules: 4 phases, 6-10 tiny steps per phase. Logical order.`;

    try {
      let endpoint = "";
      let headers = {};
      let body = {};
      let parseText = (data) => "";

      if (provider === "anthropic") {
        endpoint = "https://api.anthropic.com/v1/messages";
        headers = { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerously-allow-browser": "true" };
        body = { model: "claude-3-5-sonnet-20241022", max_tokens: 2000, system: systemPrompt, messages: [{ role: "user", content: inputVal }] };
        parseText = (data) => data.content?.find(b => b.type === "text")?.text || "";
      } else {
        endpoint = provider === "openai" ? "https://api.openai.com/v1/chat/completions" : "https://api.groq.com/openai/v1/chat/completions";
        headers = { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` };
        body = { 
          model: provider === "openai" ? "gpt-4o" : "llama3-70b-8192", 
          response_format: { type: "json_object" },
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: inputVal }] 
        };
        parseText = (data) => data.choices[0]?.message?.content || "";
      }

      const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(body) });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error?.message || `API Error: ${res.status}`);

      const rawText = parseText(data);
      const cleanJson = rawText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      setGoal(parsed.goal_title || inputVal.trim());
      setQuote(parsed.motivational_quote || "");

      const newPhases = {};
      const order = [];
      parsed.phases.forEach((ph, pi) => {
        const name = ph.name || PHASES[pi] || `Phase ${pi + 1}`;
        order.push(name);
        newPhases[name] = ph.steps.map((stepObj, si) => ({
          id: `${pi}-${si}-${Date.now()}`,
          text: typeof stepObj === 'string' ? stepObj : stepObj.action,
          time: stepObj.time || "",
          done: false,
          note: "",
        }));
      });
      setPhaseOrder(order); setPhases(newPhases); setActivePhaseIndex(0); setInputVal("");
    } catch (e) {
      setError(e.message || "Failed to parse API response. Check your key or try again.");
    }
    setLoading(false);
  };

  const toggleStep = (id) => {
    setPhases(prev => {
      const next = { ...prev };
      for (const ph in next) next[ph] = next[ph].map(s => s.id === id ? { ...s, done: !s.done } : s);
      return next;
    });
  };

  const addNote = (id, note) => {
    setPhases(prev => {
      const next = { ...prev };
      for (const ph in next) next[ph] = next[ph].map(s => s.id === id ? { ...s, note } : s);
      return next;
    });
  };

  const reset = () => {
    if(window.confirm("Are you sure you want to clear your current goal?")) {
      setGoal(""); setPhases({}); setPhaseOrder([]); setQuote(""); setError("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="app-container">
      {confetti && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999, overflow: "hidden" }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute", left: `${Math.random() * 100}%`, top: "-20px",
              width: 8 + Math.random() * 8, height: 8 + Math.random() * 8,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              background: PHASE_COLORS[i % 4],
              animation: `confettiDrop ${1.5 + Math.random() * 2}s ${Math.random() * 1}s ease-in forwards`,
            }} />
          ))}
          <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 56, animation: "float 2s ease-in-out infinite" }}>🎉</div>
        </div>
      )}

      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 60% 40% at 20% 20%, rgba(0,201,167,0.08) 0%, transparent 60%),
                     radial-gradient(ellipse 50% 60% at 80% 80%, rgba(199,125,255,0.07) 0%, transparent 60%),
                     radial-gradient(ellipse 40% 50% at 50% 50%, rgba(255,107,107,0.04) 0%, transparent 70%)`,
      }} />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#fff", padding: "0 16px 60px", maxWidth: 680, margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", paddingTop: 48, paddingBottom: 32 }}>
          <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: 4, color: "#00C9A7", textTransform: "uppercase", fontFamily: "'Syne', sans-serif", marginBottom: 12, padding: "4px 14px", border: "1px solid rgba(0,201,167,0.3)", borderRadius: 100 }}>Goal Atomizer</div>
          <h1 style={{ fontSize: "clamp(28px, 6vw, 44px)", fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1.1, marginBottom: 10, background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Any goal.<br />Broken to atoms.
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>AI breaks your goal into the tiniest possible steps.</p>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <select 
            value={provider} 
            onChange={e => setProvider(e.target.value)}
            style={{ 
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", 
              borderRadius: 12, padding: "0 12px", color: "#fff", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer"
            }}
          >
            {PROVIDERS.map(p => <option key={p.id} value={p.id} style={{ background: "#0a0a1a" }}>{p.name}</option>)}
          </select>
          
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder={`Paste ${PROVIDERS.find(p => p.id === provider).name.split(' ')[0]} API Key`}
            style={{ flex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>

        {!goal && (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: 20, animation: "fadeSlideUp 0.5s ease" }}>
            <textarea
              ref={inputRef} value={inputVal} onChange={e => setInputVal(e.target.value)}
              placeholder="What's your goal? Be specific or broad — I'll handle it.&#10;&#10;e.g. 'Build a Solana Trading Bot in Node.js'"
              rows={4} onKeyDown={e => { if (e.key === "Enter" && e.metaKey) breakdownGoal(); }}
              style={{ width: "100%", background: "transparent", border: "none", color: "#fff", fontSize: 16, lineHeight: 1.6, resize: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>⌘↵ to submit</span>
              <button
                onClick={breakdownGoal} disabled={loading || !inputVal.trim()}
                style={{ background: loading ? "rgba(0,201,167,0.3)" : "linear-gradient(135deg, #00C9A7, #00a88a)", border: "none", borderRadius: 12, padding: "10px 24px", color: "#0a0a1a", fontWeight: 700, fontSize: 15, fontFamily: "'Syne', sans-serif", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s ease" }}
              >
                {loading ? "Atomizing…" : "Atomize Goal →"}
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 32, animation: "float 1.5s ease-in-out infinite" }}>⚛️</div>
            <p style={{ marginTop: 14, color: "rgba(255,255,255,0.4)", fontSize: 14, animation: "pulse 1.5s ease-in-out infinite" }}>Routing via {PROVIDERS.find(p => p.id === provider).name.split(' ')[0]}...</p>
          </div>
        )}

        {error && ( <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 12, padding: 14, color: "#FF6B6B", fontSize: 14, marginTop: 16 }}>{error}</div> )}

        {goal && phaseOrder.length > 0 && (
          <div style={{ animation: "fadeSlideUp 0.5s ease" }}>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "20px 20px 16px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: quote ? 14 : 0 }}>
                <ProgressRing percent={overallPct} size={64} stroke={5} color={overallPct === 100 ? "#00C9A7" : "#C77DFF"} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 4 }}>Current Goal</div>
                  <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Syne', sans-serif", lineHeight: 1.3 }}>{goal}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>
                    {totalDone} of {totalSteps} micro-steps complete {overallPct === 100 && " 🎉"}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                   <button onClick={exportMarkdown} style={{ background: "rgba(0,201,167,0.15)", border: "1px solid rgba(0,201,167,0.3)", borderRadius: 8, padding: "6px 12px", color: "#00C9A7", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>↓ Export</button>
                   <button onClick={reset} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 12px", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>New Goal</button>
                </div>
              </div>
              {quote && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 12, fontSize: 13, color: "rgba(255,255,255,0.45)", fontStyle: "italic", lineHeight: 1.5 }}>" {quote} "</div>
              )}
            </div>

            <div style={{ marginBottom: 20, height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #00C9A7, #C77DFF)", width: `${overallPct}%`, transition: "width 0.6s cubic-bezier(.4,2,.6,1)" }} />
            </div>

            {phaseOrder.map((phaseName, i) => (
              <PhaseGroup 
                key={phaseName} 
                phase={phaseName} 
                phaseIndex={i} 
                steps={phases[phaseName]} 
                onToggle={toggleStep} 
                onNote={addNote} 
                isActive={i === activePhaseIndex} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
