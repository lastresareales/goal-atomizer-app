import { describe, it, expect } from "vitest";
import { validateGoalInput, validateApiKey } from "./validation.js";

describe("validateGoalInput", () => {
  it("returns an error for null input", () => {
    expect(validateGoalInput(null)).toBeTruthy();
  });

  it("returns an error for empty string", () => {
    expect(validateGoalInput("")).toBeTruthy();
  });

  it("returns an error for whitespace-only input", () => {
    expect(validateGoalInput("   ")).toBeTruthy();
  });

  it("returns an error for input shorter than 5 characters", () => {
    expect(validateGoalInput("Hi")).toBeTruthy();
  });

  it("returns null for a valid goal", () => {
    expect(validateGoalInput("Learn to play guitar")).toBeNull();
  });

  it("returns null for exactly 5 characters", () => {
    expect(validateGoalInput("12345")).toBeNull();
  });

  it("returns an error for input exceeding 1000 characters", () => {
    expect(validateGoalInput("a".repeat(1001))).toBeTruthy();
  });

  it("returns null for input at exactly 1000 characters", () => {
    expect(validateGoalInput("a".repeat(1000))).toBeNull();
  });
});

describe("validateApiKey", () => {
  it("returns an error when apiKey is empty", () => {
    const msg = validateApiKey("", "Claude");
    expect(msg).toBeTruthy();
    expect(msg).toContain("Claude");
  });

  it("returns an error when apiKey is whitespace only", () => {
    expect(validateApiKey("   ", "OpenAI")).toBeTruthy();
  });

  it("returns null when a valid key is provided", () => {
    expect(validateApiKey("sk-abc123", "Claude")).toBeNull();
  });
});
