// screens.js — full screen routing and logic through Day 7:
// resume input, claim extraction, adaptive interview, and the
// real Defense Report (score, strengths, weaknesses, download).

import { state, setScreen } from "../state.js";
import { parseResumeFile, validatePastedText } from "../parsing/resumeParser.js";
import { extractClaims, hasNoUsableClaims } from "../engine/claimExtractor.js";
import {
  buildInterviewQueue,
  analyzeAnswer,
  getFollowUpQuestion,
  resetEngineState,
} from "../engine/questionEngine.js";
import { generateReport, exportReportAsText } from "../engine/reportEngine.js";
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

    // Accessibility: move focus to the new screen so keyboard and
    // screen-reader users are told the view changed, instead of their
    // focus silently staying on a now-hidden element.
    const focusTarget = target.querySelector("[data-focus-target]") || target;
    if (!focusTarget.hasAttribute("tabindex")) {
      focusTarget.setAttribute("tabindex", "-1");
    }
    focusTarget.focus({ preventScroll: true });
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
    function toggleOptional() {
      const isHidden = linkedinTextarea.style.display === "none";
      linkedinTextarea.style.display = isHidden ? "block" : "none";
      optionalToggle.setAttribute("aria-expanded", String(isHidden));
      optionalToggle.textContent = isHidden
        ? "▾ Optional: paste LinkedIn About / project context"
        : "▸ Optional: paste LinkedIn About / project context";
    }
    optionalToggle.addEventListener("click", toggleOptional);
    optionalToggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleOptional();
      }
    });
  }

  initResumeInput();
  initClaimsSummary();
  initInterview();
  initReport();
}

function initResumeInput() {
  const uploadZone = document.getElementById("upload-zone");
  const fileInput = document.getElementById("resume-file-input");
  const pasteArea = document.getElementById("resume-paste");
  const linkedinArea = document.getElementById("linkedin-context");
  const continueBtn = document.getElementById("continue-btn");

  if (!uploadZone) return;

  uploadZone.addEventListener("click", () => fileInput.click());
  uploadZone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });
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

// ===================== INTERVIEW LOGIC =====================

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
    claimText: question.claimText,
    answerText,
    analysis,
  });

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

    setTimeout(() => {
      try {
        state.report = generateReport(state.answersLog, state.claims);
        showScreen("screen-report");
      } catch (err) {
        console.error("Report generation failed:", err);
        typingRow.remove();
        chatWindow.appendChild(
          createChatRow(
            "Something went wrong generating your report. Please try clicking Restart and running the interview again.",
            "system"
          )
        );
        chatWindow.scrollTop = chatWindow.scrollHeight;
      }
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

// ===================== DAY 7: REPORT RENDERING =====================

const SCORE_RING_CIRCUMFERENCE = 2 * Math.PI * 68; // r=68, matches the SVG circle

function renderReport() {
  const report = state.report;
  if (!report) return;

  // Score ring
  const scoreCircle = document.querySelector("#screen-report .score-ring circle:nth-child(2)");
  const scoreText = document.querySelector("#screen-report .score-ring-value");
  const offset = SCORE_RING_CIRCUMFERENCE * (1 - report.score / 100);
  scoreCircle.setAttribute("stroke-dasharray", SCORE_RING_CIRCUMFERENCE.toFixed(1));
  scoreCircle.setAttribute("stroke-dashoffset", offset.toFixed(1));
  scoreText.textContent = `${report.score}%`;

  // Color the ring based on score band
  const ringColor = report.score >= 75 ? "#4ADE80" : report.score >= 50 ? "#F5A623" : "#F87171";
  scoreCircle.setAttribute("stroke", ringColor);

  // Feedback paragraph (inserted above the strengths section)
  let feedbackEl = document.getElementById("report-feedback-text");
  if (!feedbackEl) {
    feedbackEl = document.createElement("p");
    feedbackEl.id = "report-feedback-text";
    feedbackEl.className = "subtext";
    document.querySelector("#screen-report .score-ring-wrap").insertAdjacentElement("afterend", feedbackEl);
  }
  feedbackEl.textContent = report.feedback;

  // Strengths
  const strengthsList = document.querySelector("#screen-report .report-list.strengths");
  strengthsList.innerHTML = "";
  report.strengths.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    strengthsList.appendChild(li);
  });

  // Weaknesses
  const weaknessesList = document.querySelector("#screen-report .report-list.weaknesses");
  weaknessesList.innerHTML = "";
  if (report.weaknesses.length === 0) {
    const li = document.createElement("li");
    li.textContent = "None flagged — nice work across the board.";
    weaknessesList.appendChild(li);
  } else {
    report.weaknesses.forEach((w) => {
      const li = document.createElement("li");
      li.textContent = w;
      weaknessesList.appendChild(li);
    });
  }

  // Suggestions
  const suggestionsList = document.querySelectorAll("#screen-report .report-list")[2];
  suggestionsList.innerHTML = "";
  report.suggestions.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    suggestionsList.appendChild(li);
  });

  // Practice questions
  const practiceList = document.querySelectorAll("#screen-report .report-list")[3];
  practiceList.innerHTML = "";
  report.practiceQuestions.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = p;
    practiceList.appendChild(li);
  });
}

function downloadReport() {
  if (!state.report) return;
  const text = exportReportAsText(state.report);
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "defense-report.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function initReport() {
  const reportScreen = document.getElementById("screen-report");
  const downloadBtn = document.getElementById("download-report-btn");
  const restartBtn = document.querySelector('#screen-report [data-goto="screen-landing"]');

  if (!reportScreen) return;

  const observer = new MutationObserver(() => {
    if (reportScreen.classList.contains("active")) {
      renderReport();
    }
  });
  observer.observe(reportScreen, { attributes: true, attributeFilter: ["class"] });

  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadReport);
  }

  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      state.resumeText = "";
      state.linkedinContext = "";
      state.claims = { technicalSkills: [], projects: [], education: [], behavioral: [] };
      state.interviewQueue = [];
      state.currentQuestionIndex = 0;
      state.answersLog = [];
      state.report = null;

      document.getElementById("resume-paste").value = "";
      document.getElementById("linkedin-context").value = "";
      setUploadZoneStatus("Drag & drop your PDF, DOCX, or TXT file");
      clearInputError();
    });
  }
}
