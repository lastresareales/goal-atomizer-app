import { describe, it, expect } from "vitest";
import {
  calculateProgress,
  findActivePhase,
  generateMarkdown,
} from "./goalCalculations.js";

const makeStep = (id, done = false, text = "Do something", time = "5m", note = "") => ({
  id,
  text,
  time,
  done,
  note,
});

describe("calculateProgress", () => {
  it("returns zeros when there are no phases", () => {
    const result = calculateProgress([], {});
    expect(result).toEqual({ totalDone: 0, totalSteps: 0, overallPct: 0 });
  });

  it("returns 0% when no steps are done", () => {
    const phaseOrder = ["Foundation"];
    const phases = {
      Foundation: [makeStep("1", false), makeStep("2", false)],
    };
    const result = calculateProgress(phaseOrder, phases);
    expect(result).toEqual({ totalDone: 0, totalSteps: 2, overallPct: 0 });
  });

  it("calculates partial progress correctly", () => {
    const phaseOrder = ["Foundation", "Momentum"];
    const phases = {
      Foundation: [makeStep("1", true), makeStep("2", false)],
      Momentum: [makeStep("3", true), makeStep("4", true)],
    };
    const result = calculateProgress(phaseOrder, phases);
    expect(result.totalDone).toBe(3);
    expect(result.totalSteps).toBe(4);
    expect(result.overallPct).toBe(75);
  });

  it("returns 100% when all steps are done", () => {
    const phaseOrder = ["Foundation"];
    const phases = {
      Foundation: [makeStep("1", true), makeStep("2", true)],
    };
    const result = calculateProgress(phaseOrder, phases);
    expect(result.overallPct).toBe(100);
  });

  it("handles phases missing from the phases map gracefully", () => {
    const phaseOrder = ["Foundation", "Missing"];
    const phases = {
      Foundation: [makeStep("1", true)],
    };
    const result = calculateProgress(phaseOrder, phases);
    expect(result.totalSteps).toBe(1);
    expect(result.totalDone).toBe(1);
  });
});

describe("findActivePhase", () => {
  it("returns 0 when no phases exist", () => {
    expect(findActivePhase([], {})).toBe(0);
  });

  it("returns the index of the first phase with incomplete steps", () => {
    const phaseOrder = ["Foundation", "Momentum", "Execution"];
    const phases = {
      Foundation: [makeStep("1", true)],
      Momentum: [makeStep("2", false), makeStep("3", true)],
      Execution: [makeStep("4", false)],
    };
    expect(findActivePhase(phaseOrder, phases)).toBe(1);
  });

  it("returns the last phase index when all steps are done", () => {
    const phaseOrder = ["Foundation", "Momentum"];
    const phases = {
      Foundation: [makeStep("1", true)],
      Momentum: [makeStep("2", true)],
    };
    expect(findActivePhase(phaseOrder, phases)).toBe(1);
  });

  it("skips phases not present in the phases map", () => {
    const phaseOrder = ["Foundation", "Momentum"];
    const phases = {
      Foundation: [makeStep("1", true)],
      // Momentum missing — treated as empty → all done → falls through
    };
    expect(findActivePhase(phaseOrder, phases)).toBe(1);
  });
});

describe("generateMarkdown", () => {
  it("includes the goal title and quote", () => {
    const md = generateMarkdown("Learn Guitar", "Practice makes perfect", [], {});
    expect(md).toContain("# Goal: Learn Guitar");
    expect(md).toContain("Practice makes perfect");
  });

  it("lists phases and steps with completion status", () => {
    const phaseOrder = ["Foundation"];
    const phases = {
      Foundation: [
        makeStep("1", true, "Buy a guitar", "1h"),
        makeStep("2", false, "Learn C chord", "30m"),
      ],
    };
    const md = generateMarkdown("Learn Guitar", "", phaseOrder, phases);
    expect(md).toContain("## Phase 1: Foundation");
    expect(md).toContain("- [x] Buy a guitar");
    expect(md).toContain("- [ ] Learn C chord");
    expect(md).toContain("⏱ 1h");
  });

  it("includes notes when present", () => {
    const phaseOrder = ["Foundation"];
    const phases = {
      Foundation: [{ id: "1", text: "Practice", time: "10m", done: false, note: "Use a metronome" }],
    };
    const md = generateMarkdown("Learn Guitar", "", phaseOrder, phases);
    expect(md).toContain("Note: Use a metronome");
  });

  it("handles empty phaseOrder without errors", () => {
    const md = generateMarkdown("Empty Goal", "No steps yet", [], {});
    expect(md).toContain("# Goal: Empty Goal");
  });
});
