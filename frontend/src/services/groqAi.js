/**
 * groqAi.js
 * Service for Groq Cloud LLM API (Llama 3.3 70B / Llama 3 8B).
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Calls Groq API with user prompt and optional conversation history.
 */
export async function queryGroqAi(messages, systemInstruction = '') {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API Key (VITE_GROQ_API_KEY) is missing in frontend/.env');
  }

  const payloadMessages = [];
  if (systemInstruction) {
    payloadMessages.push({ role: 'system', content: systemInstruction });
  }

  if (Array.isArray(messages)) {
    payloadMessages.push(...messages);
  } else if (typeof messages === 'string') {
    payloadMessages.push({ role: 'user', content: messages });
  }

  const body = {
    model: 'llama-3.3-70b-versatile',
    messages: payloadMessages,
    temperature: 0.7,
    max_tokens: 1500,
  };

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Groq API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'No response generated.';
}

/**
 * Uses Groq Llama-3.3 70B to generate 100% REAL, SPECIFIC landmark places for ANY city worldwide (e.g. Manali, Agra, Vijayawada, Paris, Tokyo).
 * Completely eliminates generic templates!
 */
export async function fetchRealPlacesFromGroqAi(destination) {
  const prompt = `Return a JSON array of 8-10 REAL famous places for "${destination}".
Include real tourist attractions, famous real hotels, top local restaurants, real hospitals, and real ATMs in "${destination}".

OUTPUT REQUIREMENTS:
- Output ONLY valid raw JSON array.
- Each object MUST have:
  "name": string (EXACT REAL NAME of the place in ${destination}, e.g. "Hadimba Temple", "Solang Valley", "Taj Mahal", "Kanaka Durga Temple"),
  "category": string ("Attraction" | "Hotel" | "Restaurant" | "Hospital" | "ATM"),
  "address": string (real street or area in ${destination}),
  "priceEstimate": string (e.g. "₹250 entry" or "₹3,500 / night" or "₹600 / person" or "24/7 Emergency" or "Free Cash Withdrawal"),
  "rating": number (between 4.5 and 4.9)

Example format:
[
  {"name": "Hadimba Temple", "category": "Attraction", "address": "Mall Road, Manali", "priceEstimate": "₹50 entry", "rating": 4.8},
  {"name": "Solang Valley", "category": "Attraction", "address": "Solang Valley, Manali", "priceEstimate": "Free Entry", "rating": 4.9}
]

No conversational intro or markdown outside the JSON block.`;

  try {
    const rawReply = await queryGroqAi(
      [{ role: 'user', content: prompt }],
      'You are a real-world travel database API returning valid raw JSON arrays only.'
    );

    // Extract JSON array from response
    const jsonMatch = rawReply.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Groq AI places fetch notice:', err);
  }

  return [];
}

/**
 * Generates an automated Day-by-Day schedule given destination, duration, and selected places.
 */
export async function generateAiDayPlan(destination, durationDays, selectedPlaces = []) {
  const placesListStr = selectedPlaces.length > 0
    ? selectedPlaces.map((p, i) => `${i + 1}. ${p.name} (${p.category})`).join('\n')
    : 'None explicitly pre-selected. Please suggest top attractions, local food, and sights!';

  const prompt = `You are SmartTrip AI, an expert travel planner.
Generate a structured ${durationDays}-day itinerary for a trip to "${destination}".

Selected places by user:
${placesListStr}

Requirements:
- Organize into Day 1, Day 2, ..., Day ${durationDays}.
- For each day, provide 3 slots: Morning (9 AM - 12 PM), Afternoon (1 PM - 4 PM), Evening (5 PM - 9 PM).
- Include brief insider travel advice, local food highlights, and transport tips for ${destination}.
- Keep formatting clean using bold headings, bullet points, and clear sections.`;

  return queryGroqAi(
    [{ role: 'user', content: prompt }],
    `You are SmartTrip AI, a world-class intelligent travel assistant specialized in travel planning, local insider knowledge, and route optimization.`
  );
}

/**
 * Uses Groq Llama-3.3 70B to fetch live authentic history, real ticket fees in INR (₹), and visitor advice for any place!
 */
export async function enrichPlaceWithGroqAi(placeName, destination) {
  const prompt = `Provide detailed authentic travel guide facts for "${placeName}" in ${destination}, India:
1. Brief Historical & Significance Overview (2-3 sentences).
2. Estimated Ticket Entry Fee in INR (₹) or if Free.
3. Best Hours & Days to Visit.
4. Top 3 Nearby Highlights or Unique Local Tips.

Format clearly with bold headers and bullet points. Keep it concise, formal, and accurate.`;

  return queryGroqAi(
    [{ role: 'user', content: prompt }],
    `You are SmartTrip AI, an authoritative Indian tourism & travel history guide.`
  );
}
