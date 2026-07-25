// Central app state — single source of truth for the session.
// Every module reads from and writes to this object; screens never
// talk to each other directly. See docs/SCHEMA.md for the full shape.

export const state = {
  currentScreen: "screen-landing",

  resumeText: "",
  linkedinContext: "",

  claims: {
    technicalSkills: [],
    projects: [],
    education: [],
    behavioral: [],
  },

  interviewQueue: [],
  currentQuestionIndex: 0,
  answersLog: [],

  report: null,
};

export function setScreen(screenId) {
  state.currentScreen = screenId;
}
