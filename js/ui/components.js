// components.js — reusable UI builder functions.

export function createChip(text) {
  const span = document.createElement("span");
  span.className = "chip";
  span.textContent = text;
  return span;
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

/**
 * Creates a full chat row (avatar + bubble) for either the system
 * (interviewer) or the user.
 */
export function createChatRow(text, sender) {
  const row = document.createElement("div");
  row.className = `chat-row ${sender}`;

  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.textContent = text;

  const avatar = document.createElement("span");
  avatar.className = "chat-avatar";
  avatar.textContent = sender === "system" ? "🤖" : "🧑";

  if (sender === "system") {
    row.appendChild(avatar);
    row.appendChild(bubble);
  } else {
    row.appendChild(bubble);
    row.appendChild(avatar);
  }

  return row;
}

/**
 * Creates the animated "typing..." indicator row shown briefly before
 * a system question appears.
 */
export function createTypingIndicatorRow() {
  const row = document.createElement("div");
  row.className = "chat-row system";
  row.id = "typing-indicator-row";

  const avatar = document.createElement("span");
  avatar.className = "chat-avatar";
  avatar.textContent = "🤖";

  const indicator = document.createElement("div");
  indicator.className = "typing-indicator";
  indicator.innerHTML = "<span></span><span></span><span></span>";

  row.appendChild(avatar);
  row.appendChild(indicator);
  return row;
}
