// reportEngine.js
// Aggregates a completed interview session into the final Defense
// Report: score, strengths, weaknesses, feedback, suggestions, and
// practice questions. 100% local JavaScript — no API, no cost.

const FEEDBACK_BY_BAND = {
  high: [
    "You communicate your experience with strong specificity and confidence. Your answers consistently included concrete details, which is exactly what interviewers are listening for.",
    "This was a strong defense. You backed up your claims with real detail rather than generic statements — that's the difference between a resume that reads well and a candidate who interviews well.",
    "Excellent work. You showed you can go beyond what's written on the page and speak to the substance behind it, which builds real interviewer confidence.",
  ],
  mid: [
    "You're on the right track — some answers were specific and confident, but a few could use more concrete detail (numbers, outcomes, specific decisions) to fully land.",
    "A solid attempt overall. The stronger answers show you clearly understand your own work — now it's about bringing that same specificity to every claim, not just some.",
    "You defended several claims well. The next step is consistency: treating every bullet point on your resume with the same level of preparation as your strongest answer today.",
  ],
  low: [
    "This is a useful starting point. Several answers were too general to fully defend a claim — the good news is this is entirely fixable with focused practice before your next real interview.",
    "Right now your answers lean vague, which is common before you've rehearsed. Treat this report as your prep checklist, not a verdict — go through the weak claims below and practice concrete versions.",
    "There's a real gap right now between what your resume claims and what you can currently back up out loud. That gap is exactly what this tool exists to close — use the suggestions below as your starting point.",
  ],
};

const SUGGESTION_TEMPLATES = [
  'Rewrite "{claim}" to include a measurable outcome — a number, a percentage, or a concrete scale.',
  'For "{claim}", prepare one specific example you can describe in under 30 seconds, including what you personally did.',
  'Practice explaining "{claim}" out loud — focus on the decision you made and why, not just the tools you used.',
];

function scoreBand(score) {
  if (score >= 75) return "high";
  if (score >= 50) return "mid";
  return "low";
}

function analysisToPoints(analysis) {
  if (analysis === "strong") return 100;
  if (analysis === "adequate") return 70;
  return 40; // vague
}

/**
 * Main export. Aggregates the interview session into a report.
 *
 * @param {Array<{questionText:string, answerText:string, analysis:string}>} answersLog
 * @param {{technicalSkills:string[], projects:string[], education:string[], behavioral:string[]}} claims
 * @returns {{score:number, strengths:string[], weaknesses:string[], feedback:string, suggestions:string[], practiceQuestions:string[]}}
 */
export function generateReport(answersLog, claims) {
  if (!answersLog || answersLog.length === 0) {
    throw { code: "NO_ANSWERS_RECORDED", message: "No interview answers were recorded." };
  }

  // --- Score ---
  const totalPoints = answersLog.reduce((sum, a) => sum + analysisToPoints(a.analysis), 0);
  const score = Math.round(totalPoints / answersLog.length);

  // --- Strengths & weaknesses ---
  const strengths = answersLog
    .filter((a) => a.analysis === "strong")
    .map((a) => a.claimText || summarizeClaimFromQuestion(a.questionText))
    .filter(Boolean);

  const weaknesses = answersLog
    .filter((a) => a.analysis === "vague")
    .map((a) => a.claimText || summarizeClaimFromQuestion(a.questionText))
    .filter(Boolean);

  // Deduplicate (a claim with both an initial + follow-up vague answer
  // would otherwise appear twice)
  const uniqueStrengths = [...new Set(strengths)].slice(0, 5);
  const uniqueWeaknesses = [...new Set(weaknesses)].slice(0, 5);

  // --- Feedback ---
  const band = scoreBand(score);
  const feedbackOptions = FEEDBACK_BY_BAND[band];
  const feedback = feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];

  // --- Suggestions (based on weak claims) ---
  const suggestions = uniqueWeaknesses.slice(0, 3).map((claim, i) => {
    const template = SUGGESTION_TEMPLATES[i % SUGGESTION_TEMPLATES.length];
    return template.replace("{claim}", claim);
  });
  if (suggestions.length === 0) {
    suggestions.push("Keep rehearsing out loud — even strong answers get stronger with repetition before a real interview.");
  }

  // --- Practice questions: pull from claims the user wasn't asked about ---
  const askedClaims = new Set(answersLog.map((a) => a.claimText || summarizeClaimFromQuestion(a.questionText)));
  const allClaims = [
    ...(claims.projects || []),
    ...(claims.technicalSkills || []),
    ...(claims.behavioral || []),
    ...(claims.education || []),
  ];
  const unaskedClaims = allClaims.filter((c) => !askedClaims.has(c));
  const practiceQuestions = unaskedClaims.slice(0, 3).map((c) => `Tell me more about "${c}" — how would you defend that in an interview?`);

  if (practiceQuestions.length === 0) {
    practiceQuestions.push("Walk me through a bug or mistake you couldn't fix on your first attempt.");
    practiceQuestions.push("What's a piece of feedback you received that changed how you work?");
  }

  return {
    score,
    strengths: uniqueStrengths.length > 0 ? uniqueStrengths : ["Keep practicing — no claims were fully nailed down yet, but that's exactly what this report is for."],
    weaknesses: uniqueWeaknesses,
    feedback,
    suggestions,
    practiceQuestions,
  };
}

/**
 * Extracts a short, readable claim label from a filled question string.
 * Our templates always wrap the claim in quotes-free interpolation, so
 * we approximate by taking the text between common template anchors.
 */
function summarizeClaimFromQuestion(questionText) {
  if (!questionText) return "";
  // Strip common leading phrases so what's left is closer to the claim itself.
  const cleaned = questionText
    .replace(/^(Tell me about|You listed|What was the hardest technical decision you made while working on|If you rebuilt|Who used|How did you actually learn|How did|What's a limitation of|What's something from|What would you do differently if you faced|What was the hardest part of|Can you be more specific|Got it|That's a bit general)/i, "")
    .replace(/[?.]+$/, "")
    .trim();

  const truncated = cleaned.length > 60 ? cleaned.slice(0, 60).trim() + "..." : cleaned;
  return truncated.length > 3 ? truncated : questionText.slice(0, 60);
}

/**
 * Serializes a report into a plain-text format ready for download.
 *
 * @param {object} report
 * @returns {string}
 */
export function exportReportAsText(report) {
  const lines = [];
  lines.push("DEFENSE REPORT");
  lines.push("Generated by Defend Your Experience");
  lines.push("=".repeat(40));
  lines.push("");
  lines.push(`Overall Confidence Score: ${report.score}%`);
  lines.push("");
  lines.push(report.feedback);
  lines.push("");
  lines.push("STRONGEST CLAIMS");
  report.strengths.forEach((s) => lines.push(`  - ${s}`));
  lines.push("");
  lines.push("NEEDS WORK");
  if (report.weaknesses.length === 0) {
    lines.push("  - None flagged — nice work.");
  } else {
    report.weaknesses.forEach((w) => lines.push(`  - ${w}`));
  }
  lines.push("");
  lines.push("SUGGESTIONS");
  report.suggestions.forEach((s) => lines.push(`  - ${s}`));
  lines.push("");
  lines.push("PRACTICE QUESTIONS FOR NEXT TIME");
  report.practiceQuestions.forEach((p) => lines.push(`  - ${p}`));
  lines.push("");
  lines.push("=".repeat(40));
  lines.push("Built with Claude as part of the AB Talks 60-Day Claude AI Challenge.");

  return lines.join("\n");
}
