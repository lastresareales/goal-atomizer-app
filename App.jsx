import React, { useReducer, useEffect, useRef, useMemo, useCallback } from "react";
import { PHASES, PROVIDERS } from "./constants/AppConstants";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { getProviderConfig, findProvider } from "./api/providerConfig";
import { calculateProgress, findActivePhase, generateMarkdown } from "./utils/goalCalculations";
import { validateGoalInput, validateApiKey } from "./utils/validation";
import { logger } from "./utils/logger";
import { styles } from "./styles/styles";
import GoalInputForm from "./components/GoalInputForm";
import ProgressSection from "./components/ProgressSection";
import LoadingState from "./components/LoadingState";
import ConfettiCelebration from "./components/ConfettiCelebration";
import "./index.css";

// ---------------------------------------------------------------------------
// State management via useReducer
// ---------------------------------------------------------------------------

const initialGoalState = {
  goal: "",
  phases: {},
  phaseOrder: [],
  quote: "",
};

function goalReducer(state, action) {
  switch (action.type) {
    case "SET_GOAL_DATA":
      return {
        ...state,
        goal: action.goal,
        phases: action.phases,
        phaseOrder: action.phaseOrder,
        quote: action.quote,
      };
    case "RESET":
      return { ...initialGoalState };
    case "TOGGLE_STEP": {
      const next = { ...state.phases };
      for (const ph in next) {
        next[ph] = next[ph].map((s) =>
          s.id === action.id ? { ...s, done: !s.done } : s
        );
      }
      return { ...state, phases: next };
    }
    case "ADD_NOTE": {
      const next = { ...state.phases };
      for (const ph in next) {
        next[ph] = next[ph].map((s) =>
          s.id === action.id ? { ...s, note: action.note } : s
        );
      }
      return { ...state, phases: next };
    }
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// App Component
// ---------------------------------------------------------------------------

export default function App() {
  // Persisted settings
  const [provider, setProvider] = useLocalStorage("ga_provider", "anthropic");
  const [apiKey, setApiKey] = useLocalStorage("ga_apikey", "");

  // Goal state managed by reducer; persisted separately via useEffect
  const [goalState, dispatch] = useReducer(goalReducer, null, () => {
    const load = (key, fallback) => {
      try {
        const saved = localStorage.getItem(key);
        return saved !== null ? JSON.parse(saved) : fallback;
      } catch {
        return fallback;
      }
    };
    return {
      goal: load("ga_goal", ""),
      phases: load("ga_phases", {}),
      phaseOrder: load("ga_phaseOrder", []),
      quote: load("ga_quote", ""),
    };
  });

  const { goal, phases, phaseOrder, quote } = goalState;

  // Transient UI state
  const [inputVal, setInputVal] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [confetti, setConfetti] = React.useState(false);
  const [activePhaseIndex, setActivePhaseIndex] = React.useState(0);
  const inputRef = useRef(null);

  // Persist goal state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("ga_goal", JSON.stringify(goal));
      localStorage.setItem("ga_phases", JSON.stringify(phases));
      localStorage.setItem("ga_phaseOrder", JSON.stringify(phaseOrder));
      localStorage.setItem("ga_quote", JSON.stringify(quote));
    } catch {
      // Silently ignore write failures
    }
  }, [goal, phases, phaseOrder, quote]);

  // Memoized progress calculations
  const { totalDone, totalSteps, overallPct } = useMemo(
    () => calculateProgress(phaseOrder, phases),
    [phaseOrder, phases]
  );

  // Confetti trigger + active phase tracking
  useEffect(() => {
    if (overallPct === 100 && totalSteps > 0) {
      setConfetti(true);
      const timer = setTimeout(() => setConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [overallPct, totalSteps]);

  useEffect(() => {
    setActivePhaseIndex(findActivePhase(phaseOrder, phases));
  }, [totalDone, phaseOrder, phases]);

  // ---------------------------------------------------------------------------
  // Event handlers (memoized with useCallback)
  // ---------------------------------------------------------------------------

  const toggleStep = useCallback((id) => {
    dispatch({ type: "TOGGLE_STEP", id });
  }, []);

  const addNote = useCallback((id, note) => {
    dispatch({ type: "ADD_NOTE", id, note });
  }, []);

  const exportMarkdown = useCallback(() => {
    const md = generateMarkdown(goal, quote, phaseOrder, phases);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Goal_Plan_${goal.replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [goal, quote, phaseOrder, phases]);

  const reset = useCallback(() => {
    if (window.confirm("Are you sure you want to clear your current goal?")) {
      dispatch({ type: "RESET" });
      setError("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  const breakdownGoal = useCallback(async () => {
    const goalError = validateGoalInput(inputVal);
    if (goalError) { setError(goalError); return; }

    const currentProvider = findProvider(provider);
    const keyError = validateApiKey(apiKey, currentProvider.name);
    if (keyError) { setError(keyError); return; }

    setLoading(true);
    setError("");
    dispatch({ type: "SET_GOAL_DATA", goal: "", phases: {}, phaseOrder: [], quote: "" });
    logger.log("Sending request via", currentProvider.name);

    try {
      const { endpoint, headers, body, parseText } = getProviderConfig(provider, apiKey, inputVal);
      const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(body) });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error?.message || `API Error: ${res.status}`);

      const rawText = parseText(data);
      const cleanJson = rawText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      logger.log("Parsed response", parsed);

      const newPhases = {};
      const order = [];
      parsed.phases.forEach((ph, pi) => {
        const name = ph.name || PHASES[pi] || `Phase ${pi + 1}`;
        order.push(name);
        newPhases[name] = ph.steps.map((stepObj, si) => ({
          id: `${pi}-${si}-${Date.now()}`,
          text: typeof stepObj === "string" ? stepObj : stepObj.action,
          time: stepObj.time || "",
          done: false,
          note: "",
        }));
      });

      dispatch({
        type: "SET_GOAL_DATA",
        goal: parsed.goal_title || inputVal.trim(),
        phases: newPhases,
        phaseOrder: order,
        quote: parsed.motivational_quote || "",
      });
      setInputVal("");
      setActivePhaseIndex(0);
    } catch (e) {
      logger.error("API error", e);
      setError(e.message || "Failed to parse API response. Check your key or try again.");
    }
    setLoading(false);
  }, [inputVal, provider, apiKey]);

  // ---------------------------------------------------------------------------
  // Derived display values
  // ---------------------------------------------------------------------------

  const currentProvider = useMemo(() => findProvider(provider), [provider]);

  return (
    <div className="app-container">
      {confetti && <ConfettiCelebration />}

      <div style={styles.backgroundGradient} />

      <div style={styles.appContainer}>
        {/* Header */}
        <div style={styles.headerSection}>
          <div style={styles.headerBadge}>Goal Atomizer</div>
          <h1 style={styles.headerTitle}>
            Any goal.<br />Broken to atoms.
          </h1>
          <p style={styles.headerSubtitle}>AI breaks your goal into the tiniest possible steps.</p>
        </div>

        {/* Provider & API key selection */}
        <div style={styles.providerRow}>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            style={styles.providerSelect}
          >
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id} style={{ background: "#0a0a1a" }}>
                {p.name}
              </option>
            ))}
          </select>

          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Paste ${currentProvider.name.split(" ")[0]} API Key`}
            style={styles.apiKeyInput}
          />
        </div>

        {/* Goal input form (shown before a goal is set) */}
        {!goal && (
          <GoalInputForm
            inputVal={inputVal}
            onInputChange={setInputVal}
            onSubmit={breakdownGoal}
            loading={loading}
            inputRef={inputRef}
          />
        )}

        {/* Loading indicator */}
        {loading && <LoadingState providerName={currentProvider.name} />}

        {/* Error message */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Goal progress (shown after a goal is set) */}
        {goal && phaseOrder.length > 0 && (
          <ProgressSection
            goal={goal}
            quote={quote}
            phaseOrder={phaseOrder}
            phases={phases}
            totalDone={totalDone}
            totalSteps={totalSteps}
            overallPct={overallPct}
            activePhaseIndex={activePhaseIndex}
            onToggle={toggleStep}
            onNote={addNote}
            onExport={exportMarkdown}
            onReset={reset}
          />
        )}
      </div>
    </div>
  );
}
