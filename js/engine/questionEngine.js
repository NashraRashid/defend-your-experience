// questionEngine.js
// Builds a personalized interview queue from extracted claims, and
// analyzes answer quality to decide on follow-up branching.
// 100% rule-based JavaScript — no API calls, no cost. This module's
// exported function signatures are the exact interface a real LLM
// API would plug into later (see docs/API.md).

import { TEMPLATES, FOLLOW_UP_PROBES, fillTemplate } from "../data/questionTemplates.js";

const MAX_QUESTIONS = 7;

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `q${idCounter}`;
}

/**
 * Picks one template for a category, cycling through the list so
 * consecutive questions in the same category don't repeat the exact
 * same phrasing.
 */
function pickTemplate(category, usedCountForCategory) {
  const list = TEMPLATES[category] || TEMPLATES.projects;
  return list[usedCountForCategory % list.length];
}

/**
 * Builds an ordered interview queue from categorized claims.
 * Distributes questions across categories so the interview feels
 * balanced rather than front-loaded on one category.
 *
 * @param {{technicalSkills:string[], projects:string[], education:string[], behavioral:string[]}} claims
 * @returns {Array<{id:string, category:string, claimText:string, questionText:string, isFollowUp:boolean}>}
 */
export function buildInterviewQueue(claims) {
  const categoryOrder = ["projects", "technicalSkills", "behavioral", "education"];
  const usedCount = { projects: 0, technicalSkills: 0, behavioral: 0, education: 0 };
  const queue = [];

  // Round-robin across categories until we hit MAX_QUESTIONS or run out of claims.
  let remaining = true;
  const claimIndex = { projects: 0, technicalSkills: 0, behavioral: 0, education: 0 };

  while (remaining && queue.length < MAX_QUESTIONS) {
    remaining = false;

    for (const category of categoryOrder) {
      if (queue.length >= MAX_QUESTIONS) break;

      const claimsInCategory = claims[category] || [];
      const idx = claimIndex[category];

      if (idx < claimsInCategory.length) {
        const claimText = claimsInCategory[idx];
        const template = pickTemplate(category, usedCount[category]);

        queue.push({
          id: nextId(),
          category,
          claimText,
          questionText: fillTemplate(template, claimText),
          isFollowUp: false,
        });

        claimIndex[category] += 1;
        usedCount[category] += 1;
        remaining = true;
      }
    }
  }

  return queue;
}

/**
 * Classifies the quality/specificity of a user's answer using simple,
 * transparent heuristics — no external calls, purely local logic.
 *
 * @param {string} answerText
 * @returns {"vague"|"adequate"|"strong"}
 */
export function analyzeAnswer(answerText) {
  const text = (answerText || "").trim();

  if (text.length === 0) return "vague";

  const wordCount = text.split(/\s+/).length;
  const hasNumber = /\d/.test(text);
  const hasPercent = /%/.test(text);
  const hedgeWords = ["kind of", "sort of", "i think", "maybe", "probably", "not sure", "something like"];
  const lower = text.toLowerCase();
  const hedgeHits = hedgeWords.filter((h) => lower.includes(h)).length;

  let score = 0;
  if (wordCount >= 12) score += 1;
  if (wordCount >= 25) score += 1;
  if (hasNumber) score += 1;
  if (hasPercent) score += 1;
  score -= hedgeHits;

  if (score <= 0 || wordCount < 6) return "vague";
  if (score >= 2) return "strong";
  return "adequate";
}

/**
 * Returns a follow-up probe question for a vague answer, cycling
 * through the available probes so repeats don't feel identical.
 */
let probeIndex = 0;
export function getFollowUpQuestion() {
  const probe = FOLLOW_UP_PROBES[probeIndex % FOLLOW_UP_PROBES.length];
  probeIndex += 1;
  return probe;
}

/**
 * Resets internal counters — call when starting a brand new interview
 * session (e.g. after "Restart"), so IDs and probe cycling start fresh.
 */
export function resetEngineState() {
  idCounter = 0;
  probeIndex = 0;
}
