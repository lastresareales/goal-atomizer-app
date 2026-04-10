import { useState, useEffect } from "react";

/**
 * Loads a value from localStorage, parsing JSON.
 * Returns fallback if not found or on parse error.
 */
function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * A custom hook that syncs a piece of state to localStorage.
 * @param {string} key - The localStorage key
 * @param {*} initialValue - The initial/fallback value
 * @returns {[*, Function]} - [value, setValue] like useState
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => loadFromStorage(key, initialValue));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silently ignore write failures (e.g. private browsing storage limit)
    }
  }, [key, value]);

  return [value, setValue];
}
