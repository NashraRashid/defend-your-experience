// components.js — reusable UI builder functions.

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

/**
 * Renders a claims group (label + row of chips) into a container.
 * If the category is empty, the whole group is skipped (not shown).
 */
export function renderClaimsGroup(containerEl, label, items) {
  if (!items || items.length === 0) return;

  const group = document.createElement("div");
  group.className = "claims-group";

  const labelEl = document.createElement("div");
  labelEl.className = "claims-group-label";
  labelEl.textContent = label;
  group.appendChild(labelEl);

  const row = document.createElement("div");
  row.className = "chip-row";
  items.forEach((item) => row.appendChild(createChip(item)));
  group.appendChild(row);

  containerEl.appendChild(group);
}
