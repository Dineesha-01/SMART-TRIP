/**
 * groqAi.js
 * Frontend client for SmartTrip's AI Assistant.
 * Calls our own backend (/api/v1/ai/**) — the Groq key stays server-side.
 */

import { requestWithRetry } from './apiClient';

export async function queryGroqAi(messages, destination = '') {
  const data = await requestWithRetry('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, destination }),
  });
  return data?.content || 'No response generated.';
}

export async function fetchRealPlacesFromGroqAi(destination) {
  try {
    const data = await requestWithRetry('/ai/real-places', {
      method: 'POST',
      body: JSON.stringify({ destination }),
    });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('AI places fetch notice:', err);
    return [];
  }
}

export async function generateAiDayPlan(destination, durationDays, selectedPlaces = []) {
  const data = await requestWithRetry('/ai/day-plan', {
    method: 'POST',
    body: JSON.stringify({
      destination,
      durationDays,
      selectedPlaces: selectedPlaces.map((p) => ({ name: p.name, category: p.category })),
    }),
  });
  return data?.content || 'No response generated.';
}

export async function enrichPlaceWithGroqAi(placeName, destination) {
  const data = await requestWithRetry('/ai/enrich-place', {
    method: 'POST',
    body: JSON.stringify({ placeName, destination }),
  });
  return data?.content || 'No response generated.';
}