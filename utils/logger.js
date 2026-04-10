const isDev = typeof process !== "undefined" && process.env?.NODE_ENV === "development";

export const logger = {
  log: (message, data) => {
    if (isDev) {
      console.log(`[Goal Atomizer] ${message}`, data !== undefined ? data : "");
    }
  },
  warn: (message, data) => {
    if (isDev) {
      console.warn(`[Goal Atomizer] ${message}`, data !== undefined ? data : "");
    }
  },
  error: (message, data) => {
    if (isDev) {
      console.error(`[Goal Atomizer] ${message}`, data !== undefined ? data : "");
    }
  },
};
