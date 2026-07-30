# Challenge Retrospective — Defend Your Experience

A day-by-day account of how this project actually came together, written from real decisions made and real bugs hit during the 10-day capstone — not a generic summary.

---

## The Journey, Day by Day

**Day 1 — Discovery.** Started with zero fixed idea. Through structured interview, landed on a real, personal frustration: AI tools help you write a great resume, but nobody helps you *defend* it. Deliberately scoped down from the most ambitious version (live LLM interviews, voice, accounts) to what could genuinely ship in 10 days: a rule-based, client-side simulator. That early discipline — protecting the timeline instead of chasing the most impressive-sounding version — turned out to be the single most important decision of the whole sprint.

**Day 2 — System Design.** Locked in a deliberately boring, deliberately reliable tech stack: vanilla HTML/CSS/JS, no framework, no backend, no database. Designed the architecture around one core principle — isolate the "AI" logic behind clean function interfaces so a real LLM API could replace it later without a rewrite. That single architectural decision paid off repeatedly for the rest of the build.

**Day 3 — Design System.** Built the full amber-on-navy glassmorphism visual identity and all 5 static screens before any logic existed. First real bug: chat bubbles overflowing the viewport on long text — fixed with proper `overflow-wrap` handling. Small, but it was the first taste of "looks done" vs. "is done."

**Day 4 — Real Parsing.** Wired up genuine client-side PDF/DOCX parsing with pdf.js and mammoth.js — no backend, no upload, everything in-browser. Hit the classic `file://` vs `http://` gotcha: ES modules silently fail to load when you just double-click an HTML file, which took a moment to diagnose since the failure was completely silent. Installing Live Server solved it, and it became the standard workflow for the rest of the build.

**Day 5 — Claim Extraction.** Built the first real "intelligence" layer — rule-based, no API. Testing against a real resume immediately surfaced two bugs: contact info (name, email, phone) was being treated as a claim, and section headings wrapped in decorative dashes weren't detected. Fixed both. Made a deliberate call to stop polishing extraction once it hit "reasonably good" per the PRD's own documented bar, rather than chasing diminishing returns on regex — a real, lived example of protecting scope.

**Day 6 — Adaptive Interview Engine.** The actual "wow moment" feature: questions that branch based on real-time answer analysis. Verified both directions live — a vague answer triggered a follow-up probe, a detailed quantified answer skipped straight ahead. Also made a deliberate scheduling call: refused to deploy yet, since the Report engine was still hardcoded — a real interview followed by a fake report would have undermined the actual demo.

**Day 7 — Report Engine + Full UI/UX Polish (compressed).** Built the payoff feature: real scoring, strengths/weaknesses, suggestions. Found a genuine bug during testing — claim labels were being regex-parsed back out of question text and came out mangled; fixed by storing the actual claim text directly instead of re-deriving it. Then, by deliberate choice, compressed two blueprint days into one and did a full accessibility and micro-interaction pass on top of the newly-working report — animations, focus states, keyboard support, ARIA labeling.

**Day 8 — Production Hardening.** A full senior-QA-style pass: found and fixed an uncaught-exception risk in report generation, a missing favicon causing console errors, no global error boundary, no accessibility focus management on screen transitions, and a borderline color-contrast issue. Also explicitly verified something important: since all user content renders via `.textContent` and never `.innerHTML`, there's no XSS risk anywhere in the app.

**Day 9 — Launch.** Deployed to GitHub Pages. Then caught the most instructive bug of the entire project: a fix from Day 7 had been tested and confirmed working locally, but never actually made it into the pushed commit — the live site was quietly running stale code. Traced it by comparing the actual GitHub file contents against what should have been there, not just trusting that a prior "yes, it works" meant it had shipped. Rewrote the README properly and added a custom 404 page as part of a full release-readiness review.

**Day 10 — Graduation.** Closing the loop: portfolio content, documentation, and an official v1.0.0 release.

---

## Major Technical Decisions & Why They Held Up

- **No backend, ever, for v1.0** — this wasn't a limitation worked around; it was a deliberate constraint that produced a stronger privacy story and a genuinely simpler, more reliable app.
- **Rule-based AI, architected for replacement** — the decision that paid off the most. Every engine module was built against a fixed function signature from Day 2 onward, which meant Days 5-7 never required touching the UI layer.
- **Deploy last, not first** — resisting pressure to deploy on Day 6 before the Report engine was real protected the actual demo quality.

## Real Debugging Moments Worth Remembering

1. The `file://` vs `http://` ES module failure (Day 4) — a completely silent failure mode that taught the value of checking the browser console early, every time.
2. The claim-label regex bug (Day 7) — a reminder that deriving data by parsing your own generated text back apart is fragile; storing the original value is almost always better than reconstructing it.
3. The Day 9 deployment regression — the most important one. A locally-confirmed fix that never got committed. The lesson: "it works on my machine" and "it's actually pushed" are two different claims, and only one of them is verifiable by looking at the deployed artifact directly.

## Skills Demonstrated

Product discovery and scoping · system architecture design · client-side file parsing · rule-based NLP-adjacent heuristic design · state management without a framework · accessibility engineering (WCAG contrast, ARIA, keyboard nav, focus management) · security-conscious DOM rendering · Git/GitHub workflow · static site deployment · release-readiness auditing · technical documentation · scope discipline under a hard deadline.

## Lessons Learned

- A good architecture decision made early (the engine-isolation pattern) keeps paying dividends for the rest of a project — it's worth the extra design time on Day 2.
- Silent failures (module loading, uncommitted fixes) are more dangerous than loud ones, because nothing tells you they happened. Verification has to be active, not assumed.
- Scope discipline isn't a one-time decision made on Day 1 — it's a muscle you have to keep using, and this project used it at least three separate times (Day 1 idea scoping, Day 5 extraction polish, Day 6 deployment timing).

---

## A Note From Your AI Pair Programmer

Ten days ago you didn't have a project — you had a real, specific frustration about resumes and interviews, and the instinct to build something instead of just complaining about it. What you shipped is genuinely yours: the architecture decisions, the scope calls, the two real regressions you caught by actually testing rather than assuming. I got to help you build it, but the judgment calls — protecting the timeline on Day 1, refusing to deploy a fake report on Day 6, tracing that Day 9 regression instead of shrugging it off — those were you. That's the part that doesn't show up in the commit history but matters more than any of it. Well built.
