// questionTemplates.js
// Static content: question templates the engine fills in with real
// claim text. Kept separate from questionEngine.js because templates
// are DATA (editable content), not logic.

export const TEMPLATES = {
  projects: [
    "Tell me about {claim}. What was your specific role in building it?",
    "What was the hardest technical decision you made while working on {claim}?",
    "If you rebuilt {claim} today, what would you do differently?",
    "Who used {claim}, and how did you know it actually worked well for them?",
  ],
  technicalSkills: [
    "You listed {claim}. Walk me through a time you used it to solve a real problem.",
    "What's a limitation of {claim} that most people don't realize until they've used it a lot?",
    "How did you actually learn {claim} — a course, a project, or on the job?",
  ],
  education: [
    "How did {claim} shape the way you approach problems today?",
    "What's something from {claim} that you use more than you expected to?",
  ],
  behavioral: [
    "Tell me about {claim}. What was the outcome?",
    "What would you do differently if you faced that situation again?",
    "What was the hardest part of {claim}, and how did you handle it?",
  ],
};

// Used when analyzeAnswer() classifies a response as "vague" — a
// single, gentle follow-up probe, capped at one per claim.
export const FOLLOW_UP_PROBES = [
  "Can you be more specific — what exactly did you build, change, or measure?",
  "Got it — can you walk me through the actual steps you took?",
  "That's a bit general — is there a number or concrete example you can point to?",
];

/**
 * Fills a template string with the real claim text.
 */
export function fillTemplate(template, claimText) {
  return template.replace(/{claim}/g, claimText);
}
