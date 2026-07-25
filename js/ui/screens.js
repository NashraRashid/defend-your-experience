// screens.js — screen routing, resume input, claims summary, and
// Day 6: the real adaptive interview chat logic.

import { state, setScreen } from "../state.js";
import { parseResumeFile, validatePastedText } from "../parsing/resumeParser.js";
import { extractClaims, hasNoUsableClaims } from "../engine/claimExtractor.js";
import {
  buildInterviewQueue,
  analyzeAnswer,
  getFollowUpQuestion,
  resetEngineState,
} from "../engine/questionEngine.js";
import { renderClaimsGroup, createChatRow, createTypingIndicatorRow } from "./components.js";

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
  initInterview();
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
      runClaimExtraction();
      showScreen("screen-processing");
    } catch (err) {
      showInputError(err.message || "Please provide your resume text.");
    }
  });
}

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
    beginInterview();
    showScreen("screen-interview");
  });

  const processingScreen = document.getElementById("screen-processing");
  const observer = new MutationObserver(() => {
    if (processingScreen.classList.contains("active")) {
      renderClaimsSummary();
    }
  });
  observer.observe(processingScreen, { attributes: true, attributeFilter: ["class"] });
}

// ===================== DAY 6: INTERVIEW LOGIC =====================

function beginInterview() {
  resetEngineState();
  state.interviewQueue = buildInterviewQueue(state.claims);
  state.currentQuestionIndex = 0;
  state.answersLog = [];

  const chatWindow = document.getElementById("chat-window");
  chatWindow.innerHTML = "";

  updateProgress();
  askCurrentQuestion();
}

function updateProgress() {
  const header = document.querySelector("#screen-interview .progress-header");
  const fill = document.querySelector("#screen-interview .progress-bar-fill");
  const total = state.interviewQueue.length || 1;
  const current = Math.min(state.currentQuestionIndex + 1, total);

  header.innerHTML = `<span>Step 3 of 4</span><span>Question ${current} of ${total}</span>`;
  fill.style.width = `${Math.round((state.currentQuestionIndex / total) * 100)}%`;
}

function askCurrentQuestion() {
  const chatWindow = document.getElementById("chat-window");
  const chatInput = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send-btn");

  if (state.currentQuestionIndex >= state.interviewQueue.length) {
    finishInterview();
    return;
  }

  const question = state.interviewQueue[state.currentQuestionIndex];

  chatInput.disabled = true;
  sendBtn.disabled = true;

  const typingRow = createTypingIndicatorRow();
  chatWindow.appendChild(typingRow);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  setTimeout(() => {
    typingRow.remove();
    chatWindow.appendChild(createChatRow(question.questionText, "system"));
    chatWindow.scrollTop = chatWindow.scrollHeight;
    chatInput.disabled = false;
    sendBtn.disabled = false;
    chatInput.focus();
  }, 500);
}

function handleUserAnswer(answerText) {
  const chatWindow = document.getElementById("chat-window");
  const question = state.interviewQueue[state.currentQuestionIndex];

  chatWindow.appendChild(createChatRow(answerText, "user"));
  chatWindow.scrollTop = chatWindow.scrollHeight;

  const analysis = analyzeAnswer(answerText);
  state.answersLog.push({
    questionId: question.id,
    questionText: question.questionText,
    answerText,
    analysis,
  });

  // If vague and this wasn't already a follow-up, inject one probe
  // question before moving to the next claim (capped at 1 per claim).
  if (analysis === "vague" && !question.isFollowUp) {
    const probeText = getFollowUpQuestion();
    state.interviewQueue.splice(state.currentQuestionIndex + 1, 0, {
      id: `${question.id}-followup`,
      category: question.category,
      claimText: question.claimText,
      questionText: probeText,
      isFollowUp: true,
    });
  }

  state.currentQuestionIndex += 1;
  updateProgress();
  askCurrentQuestion();
}

function finishInterview() {
  const chatWindow = document.getElementById("chat-window");
  const chatInput = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send-btn");

  chatInput.disabled = true;
  sendBtn.disabled = true;

  const typingRow = createTypingIndicatorRow();
  chatWindow.appendChild(typingRow);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  setTimeout(() => {
    typingRow.remove();
    chatWindow.appendChild(
      createChatRow("That's everything — nice work. Generating your Defense Report now...", "system")
    );
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Day 7 will replace this timeout with a real call to reportEngine.js.
    setTimeout(() => {
      showScreen("screen-report");
    }, 1200);
  }, 500);
}

function initInterview() {
  const chatInput = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send-btn");
  if (!chatInput || !sendBtn) return;

  function submitAnswer() {
    const text = chatInput.value.trim();
    if (text.length === 0 || chatInput.disabled) return;
    chatInput.value = "";
    handleUserAnswer(text);
  }

  sendBtn.addEventListener("click", submitAnswer);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitAnswer();
    }
  });
}
