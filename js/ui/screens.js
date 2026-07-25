// Screen routing — shows/hides the 5 screen sections.
// Day 3 scope: navigation only. Real logic (parsing, extraction,
// interview, report generation) is wired in on Days 4-7.

import { setScreen } from "../state.js";

export function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((el) => {
    el.classList.remove("active");
  });
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add("active");
    setScreen(screenId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export function initNavigation() {
  // Any element with data-goto="screenId" navigates on click.
  document.querySelectorAll("[data-goto]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const target = el.getAttribute("data-goto");
      showScreen(target);
    });
  });

  // Optional LinkedIn context toggle (Screen 2)
  const optionalToggle = document.getElementById("optional-toggle");
  const linkedinTextarea = document.getElementById("linkedin-context");
  if (optionalToggle && linkedinTextarea) {
    optionalToggle.addEventListener("click", () => {
      const isHidden = linkedinTextarea.style.display === "none";
      linkedinTextarea.style.display = isHidden ? "block" : "none";
      optionalToggle.textContent = isHidden
        ? "▾ Optional: paste LinkedIn About / project context"
        : "▸ Optional: paste LinkedIn About / project context";
    });
  }
}
