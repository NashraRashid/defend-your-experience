// screens.js — screen routing, resume input handling, and
// Day 5: claim extraction wired to the Processing/Claims screen.

import { state, setScreen } from "../state.js";
import { parseResumeFile, validatePastedText } from "../parsing/resumeParser.js";
import { extractClaims, hasNoUsableClaims } from "../engine/claimExtractor.js";
import { renderClaimsGroup } from "./components.js";

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

function showInputError(message) {
  const errorEl = document.getElementById("input-error");
  errorEl.textContent = message;
  errorEl.classList.add("visible");
}

function clearInputError() {
  const errorEl = document.getElementById("input-error");
  errorEl.textContent = "";
  errorEl.classList.remove("visible");
}

function setUploadZoneStatus(text) {
  document.getElementById("upload-zone-text").textContent = text;
}

export function initNavigation() {
  document.querySelectorAll("[data-goto]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      showScreen(el.getAttribute("data-goto"));
    });
  });

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

  initResumeInput();
  initClaimsSummary();
}

function initResumeInput() {
  const uploadZone = document.getElementById("upload-zone");
  const fileInput = document.getElementById("resume-file-input");
  const pasteArea = document.getElementById("resume-paste");
  const linkedinArea = document.getElementById("linkedin-context");
  const continueBtn = document.getElementById("continue-btn");

  if (!uploadZone) return;

  uploadZone.addEventListener("click", () => fileInput.click());

  uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.classList.add("dragover");
  });
  uploadZone.addEventListener("dragleave", () => {
    uploadZone.classList.remove("dragover");
  });
  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  });

  async function handleFileSelected(file) {
    clearInputError();
    setUploadZoneStatus(`Reading ${file.name}...`);
    try {
      const text = await parseResumeFile(file);
      state.resumeText = text;
      pasteArea.value = text;
      setUploadZoneStatus(`✓ ${file.name} loaded (${text.length} characters)`);
    } catch (err) {
      setUploadZoneStatus("Drag & drop your PDF, DOCX, or TXT file");
      showInputError(err.message || "Something went wrong reading that file.");
    }
  }

  continueBtn.addEventListener("click", () => {
    clearInputError();

    const pastedText = pasteArea.value.trim();
    const sourceText = pastedText.length > 0 ? pastedText : state.resumeText;

    try {
      const validText = validatePastedText(sourceText);
      state.resumeText = validText;
      state.linkedinContext = linkedinArea.value.trim();

      // Day 5: run extraction the moment we have valid text, then
      // render the claims screen with real results before showing it.
      runClaimExtraction();
      showScreen("screen-processing");
    } catch (err) {
      showInputError(err.message || "Please provide your resume text.");
    }
  });
}

/**
 * Runs the claim extraction engine against state.resumeText
 * (optionally combined with the LinkedIn context field) and
 * stores the result in state.claims.
 */
function runClaimExtraction() {
  const combinedText = state.linkedinContext
    ? `${state.resumeText}\n${state.linkedinContext}`
    : state.resumeText;

  state.claims = extractClaims(combinedText);
}

const CATEGORY_LABELS = {
  projects: "Projects",
  technicalSkills: "Technical Skills",
  education: "Education",
  behavioral: "Leadership & Achievements",
};

/**
 * Renders state.claims into the #claims-container on the Processing screen.
 */
function renderClaimsSummary() {
  const container = document.getElementById("claims-container");
  const errorEl = document.getElementById("claims-error");
  const startInterviewBtn = document.getElementById("start-interview-btn");

  container.innerHTML = "";
  errorEl.textContent = "";
  errorEl.classList.remove("visible");

  if (hasNoUsableClaims(state.claims)) {
    errorEl.textContent =
      "We couldn't find much to work with in that text. Try going back and pasting more detail (like full bullet points from your resume).";
    errorEl.classList.add("visible");
    startInterviewBtn.disabled = true;
    startInterviewBtn.style.opacity = "0.5";
    startInterviewBtn.style.cursor = "not-allowed";
    return;
  }

  startInterviewBtn.disabled = false;
  startInterviewBtn.style.opacity = "1";
  startInterviewBtn.style.cursor = "pointer";

  renderClaimsGroup(container, CATEGORY_LABELS.projects, state.claims.projects);
  renderClaimsGroup(container, CATEGORY_LABELS.technicalSkills, state.claims.technicalSkills);
  renderClaimsGroup(container, CATEGORY_LABELS.education, state.claims.education);
  renderClaimsGroup(container, CATEGORY_LABELS.behavioral, state.claims.behavioral);
}

function initClaimsSummary() {
  const startInterviewBtn = document.getElementById("start-interview-btn");
  if (!startInterviewBtn) return;

  startInterviewBtn.addEventListener("click", () => {
    if (startInterviewBtn.disabled) return;
    showScreen("screen-interview");
  });

  // Re-render claims every time we land on this screen (e.g. after
  // editing the resume and coming back through).
  const processingScreen = document.getElementById("screen-processing");
  const observer = new MutationObserver(() => {
    if (processingScreen.classList.contains("active")) {
      renderClaimsSummary();
    }
  });
  observer.observe(processingScreen, { attributes: true, attributeFilter: ["class"] });
}
