/**
 * Validates the goal input before submitting to the API.
 * Returns an error message string, or null if valid.
 */
export function validateGoalInput(input) {
  if (!input || !input.trim()) {
    return "Please enter a goal before atomizing.";
  }
  if (input.trim().length < 5) {
    return "Your goal is too short. Please be more specific.";
  }
  if (input.trim().length > 1000) {
    return "Your goal is too long. Please keep it under 1000 characters.";
  }
  return null;
}

/**
 * Validates that an API key is present for the selected provider.
 * Returns an error message string, or null if valid.
 */
export function validateApiKey(apiKey, providerName) {
  if (!apiKey || !apiKey.trim()) {
    return `Please enter your ${providerName} API key.`;
  }
  return null;
}
