# Portfolio Content — Defend Your Experience

## Short Project Description (for portfolio sites, LinkedIn "Featured" section)

**Defend Your Experience** is an AI-powered interview defense simulator that helps software engineering students and fresh graduates go beyond a polished resume to actually being able to defend it under interview pressure. Upload a resume, face an adaptive mock interview built from your own claims, and get a real Defense Report scoring how well you held up. Built 100% client-side — no backend, no login, complete privacy — as a 10-day solo capstone for the AB Talks 60-Day Claude AI Challenge.

**Live app:** https://nashrarashid.github.io/defend-your-experience/
**Repo:** https://github.com/NashraRashid/defend-your-experience

---

## One-Line Pitch (for a resume header, GitHub bio, or intro)

> An AI-powered mock interview simulator that scores how well you can defend your own resume — built solo in 10 days, 100% client-side, zero API cost.

---

## Resume Bullet Points

Pick 2-3 depending on the role you're applying for — these are written to be copy-paste ready:

- Designed and built **Defend Your Experience**, a client-side AI interview simulator with adaptive question branching and dynamic scoring, from product discovery through deployment in a 10-day solo sprint
- Architected a fully modular, backend-free rule-based "AI" engine (resume parsing → claim extraction → adaptive interview → scored report) designed for a clean future swap to a real LLM API without UI changes
- Implemented client-side PDF/DOCX parsing using pdf.js and mammoth.js, with graceful degradation to a paste-text fallback when parsing libraries fail to load
- Built an adaptive interview engine using local heuristic analysis (word count, specificity, quantification) to branch follow-up questions based on real-time answer quality
- Conducted a full accessibility and security pass (WCAG contrast fixes, keyboard navigation, ARIA labeling, XSS-safe DOM rendering) ahead of public deployment
- Caught and resolved a real deployment regression during launch verification by comparing local fixes against the actual deployed GitHub commit history

---

## Interview Talking Points

**"Tell me about a project you're proud of."**
Lead with the *problem*, not the tech: AI tools help you write a great resume, but nobody rehearses defending it. Then walk through the adaptive branching logic — that's the most technically interesting part and shows real product thinking, not just CRUD.

**"What was the hardest technical decision?"**
Choosing to build the AI layer as pure rule-based JavaScript instead of waiting on a real LLM API. Explain the constraint (no budget for API costs) and how you turned it into an architectural strength — the engine is deliberately isolated behind clean function interfaces so a real API can be swapped in later without touching the UI.

**"Tell me about a bug you had to debug."**
The Day 9 deployment regression: a fix you'd made and tested locally never actually got committed, so the live site was quietly serving an older version. Walk through how you caught it (comparing expected behavior against the actual deployed code via GitHub's file search) rather than just assuming "it worked before" meant it shipped. This is a genuinely good story about release discipline, not just debugging syntax.

**"How do you handle scope creep?"**
Two concrete examples: capping claim-extraction perfection at "reasonably good, not flawless" per your own documented PRD bar (Day 5), and deliberately delaying deployment until the Report engine was real instead of shipping a fake placeholder report attached to a real interview (Day 6).

**"Why no backend?"**
Explain it as a deliberate constraint-driven decision: privacy (resume never leaves the browser), zero hosting cost, zero deployment complexity — and that the architecture is intentionally designed so a backend could be added later without a rewrite, not because you couldn't build one.

---

## Demo Script (2-3 minutes, for the Day 10 video)

**[0:00-0:25] The problem**
"AI tools can write you a great resume in minutes. But there's a gap nobody talks about: can you actually defend what's on it? Recruiters ask follow-up questions your resume can't answer for you. I built Defend Your Experience to close that gap."

**[0:25-1:45] Live walkthrough**
- Show the landing page, mention the privacy angle (100% client-side)
- Upload a real resume (PDF) — show the parsing happen live
- Show the claims summary screen — call out that this is real extraction, not fake data
- Jump into the interview — answer one question specifically/well, answer one vaguely and show the follow-up probe trigger
- Show the finished Defense Report — score, strengths, weaknesses, suggestions

**[1:45-2:15] The technical angle**
"Everything you just saw — the parsing, the question generation, the scoring — runs entirely as local JavaScript. No API, no backend, no server costs. And it's architected so I can swap in a real Claude API later without touching the UI at all."

**[2:15-2:30] Close**
"Built solo, start to finish, in 10 days as my capstone for the AB Talks 60-Day Claude AI Challenge. Link's in the description — I'd love your feedback."

---

## Suggested Screenshots / Demo Media

For the LinkedIn post, README, and case study:
1. Landing screen (establishes visual identity)
2. Claims summary screen with real extracted data (shows "intelligence")
3. Mid-interview screen showing a follow-up question triggered (the actual "wow moment")
4. Completed Defense Report with a high score (the payoff)
5. A short screen-recording GIF of the transition from Interview → Report (this is the single most shareable clip — captures the whole value prop in ~5 seconds)
