# Future Scope — Defend Your Experience

How this specific project could realistically evolve, grounded in the architecture actually built during the 10-day capstone.

---

## 3 Months: Make the Intelligence Real

The single highest-leverage change: replace the rule-based engine with a real LLM API, using the exact swap point the architecture was built for.

- Integrate the Claude API (or another free-tier-friendly LLM) behind the existing `extractClaims()`, `buildInterviewQueue()`, `analyzeAnswer()`, and `generateReport()` function signatures — no UI rewrite needed, exactly as designed in `docs/API.md`
- This immediately fixes the known extraction edge cases (dash-decorated headings, unusual resume layouts) that the rule-based engine couldn't fully solve
- Introduces a real cost/infrastructure decision for the first time: likely a lightweight serverless function (e.g., a free-tier Cloudflare Worker or Vercel Edge Function) to hold the API key server-side, since API keys can't safely live in client-side code
- Add basic rate limiting to protect against API cost abuse once a key is involved
- Voice input for answers (Web Speech API — free, browser-native) as a lighter-weight version of the originally-scoped v2.0 voice interview mode

## 6 Months: Personalization & Retention

With the AI layer solid, the next highest-value additions are things that make people come back:

- Lightweight accounts (email-based, no password — magic link) so users can save interview history and track improvement over multiple sessions
- IndexedDB-based local history as a stepping stone before full accounts, preserving the privacy-first positioning as long as possible
- Multi-resume / multi-role tracks: let a user maintain separate resume versions for different job types (e.g., frontend vs. full-stack) and get role-specific interview questions
- Shareable Defense Report links (with the user's explicit consent) — a genuinely novel feature that turns the tool into a credibility signal recruiters could actually look at
- Basic analytics (privacy-respecting, aggregate-only) to understand which claim categories trip people up most, informing better question templates

## 12 Months: Beyond Software Engineering

- Expand the claim-extraction and question-template system to additional domains (marketing, design, data science, finance) — the architecture already separates data (`questionTemplates.js`) from logic (`questionEngine.js`), so this is a content expansion, not a rewrite
- Domain-specific "interviewer personas" (technical interviewer vs. HR/behavioral interviewer vs. hiring manager) with different question styles and scoring weights
- A recruiter-facing mode: opt-in, where a candidate can generate a report specifically formatted to share with a recruiter as a preparation signal, distinct from the personal practice report
- Explore whether the core "defend your claims" interaction pattern generalizes beyond job interviews — e.g., academic thesis defense practice, scholarship interview prep — as a way to validate the underlying mechanic has value beyond the original use case

---

## What Stays the Same

Regardless of how far this grows, three decisions made in the original 10-day build are worth protecting:

1. **Privacy-first positioning** — even once a backend exists for the LLM API, resume content itself should never be stored server-side without explicit, separate user consent.
2. **The modular AI-layer boundary** — every future engine change should go through the same clean function-interface pattern established on Day 2, not bypass it for a quick win.
3. **Scope discipline** — the same instinct that shipped a working v1.0 in 10 days (cutting accounts, voice, and multi-resume from the original scope) should keep gating what gets built next.
