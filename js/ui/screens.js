// screens.js — screen routing, plus Day 4: real resume input handling.

import { state, setScreen } from "../state.js";
import { parseResumeFile, validatePastedText } from "../parsing/resumeParser.js";

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
  // Any element with data-goto="screenId" navigates on click
  // (used by simple back/skip links that don't need validation).
  document.querySelectorAll("[data-goto]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      showScreen(el.getAttribute("data-goto"));
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

  initResumeInput();
}

function initResumeInput() {
  const uploadZone = document.getElementById("upload-zone");
  const fileInput = document.getElementById("resume-file-input");
  const pasteArea = document.getElementById("resume-paste");
  const linkedinArea = document.getElementById("linkedin-context");
  const continueBtn = document.getElementById("continue-btn");

  if (!uploadZone) return; // not on this screen's DOM yet

  // Click the drop zone -> open file picker
  uploadZone.addEventListener("click", () => fileInput.click());

  // Drag and drop support
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

  // File picked via browse dialog
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
      pasteArea.value = text; // mirror into the textarea so the user can see/edit it
      setUploadZoneStatus(`✓ ${file.name} loaded (${text.length} characters)`);
    } catch (err) {
      setUploadZoneStatus("Drag & drop your PDF, DOCX, or TXT file");
      showInputError(err.message || "Something went wrong reading that file.");
    }
  }

  // Continue button: validate whichever input method has content
  continueBtn.addEventListener("click", () => {
    clearInputError();

    const pastedText = pasteArea.value.trim();
    const sourceText = pastedText.length > 0 ? pastedText : state.resumeText;

    try {
      const validText = validatePastedText(sourceText);
      state.resumeText = validText;
      state.linkedinContext = linkedinArea.value.trim();
      showScreen("screen-processing");
    } catch (err) {
      showInputError(err.message || "Please provide your resume text.");
    }
  });
}
