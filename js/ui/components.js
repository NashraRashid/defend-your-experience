// Reusable UI builder functions.
// Day 3 scope: placeholders only — real implementations arrive
// alongside the engine work on Days 5-7 (claim chips, chat bubbles
// driven by real data, score ring driven by a real score).

export function createChip(text) {
  const span = document.createElement("span");
  span.className = "chip";
  span.textContent = text;
  return span;
}

export function createChatBubble(text, sender = "system") {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.textContent = text;
  return bubble;
}
