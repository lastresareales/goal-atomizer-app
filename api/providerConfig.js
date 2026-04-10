import { PROVIDERS } from "../constants/AppConstants";

const SYSTEM_PROMPT = `You are a world-class goal-achievement strategist. Break the user's goal into the SMALLEST possible atomic micro-steps, grouped into 4 phases. 

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

/**
 * Returns provider-specific endpoint, headers, request body, and response parser.
 * @param {string} provider - One of "anthropic", "openai", "groq"
 * @param {string} apiKey - The user's API key
 * @param {string} userMessage - The user's goal input
 * @returns {{ endpoint: string, headers: Object, body: Object, parseText: Function }}
 */
export function getProviderConfig(provider, apiKey, userMessage) {
  if (provider === "anthropic") {
    return {
      endpoint: "https://api.anthropic.com/v1/messages",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerously-allow-browser": "true",
      },
      body: {
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      },
      parseText: (data) => data.content?.find((b) => b.type === "text")?.text || "",
    };
  }

  const isOpenAI = provider === "openai";
  return {
    endpoint: isOpenAI
      ? "https://api.openai.com/v1/chat/completions"
      : "https://api.groq.com/openai/v1/chat/completions",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: {
      model: isOpenAI ? "gpt-4o" : "llama3-70b-8192",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    },
    parseText: (data) => data.choices[0]?.message?.content || "",
  };
}

/**
 * Finds a provider object by id.
 * @param {string} providerId
 * @returns {{ id: string, name: string }}
 */
export function findProvider(providerId) {
  return PROVIDERS.find((p) => p.id === providerId) || PROVIDERS[0];
}
