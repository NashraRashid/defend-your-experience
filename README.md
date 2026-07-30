# Defend Your Experience

**An AI-powered interview defense simulator.** Upload your resume, face an adaptive mock interview built from your own claims, and get a real Defense Report on how well you held up — 100% private, runs entirely in your browser.

🔗 **Live app:** https://nashrarashid.github.io/defend-your-experience/

---

## The Problem

AI tools can polish your resume in minutes. But a polished resume creates false confidence — recruiters and interviewers probe every claim, and most candidates have never rehearsed defending their own bullet points out loud. Defend Your Experience closes that gap.

## How It Works

1. **Upload or paste your resume** (PDF, DOCX, TXT, or plain text)
2. The app **extracts and categorizes your claims** — Projects, Technical Skills, Education, Leadership
3. You go through an **adaptive chat interview** — questions branch based on how specific and confident your answers are
4. You get a **Defense Report**: a confidence score, your strongest and weakest claims, and concrete suggestions to improve

## Screenshots

*(See the live app above for the full experience — landing, resume input, claims summary, adaptive interview, and Defense Report.)*

## Key Features

- **Multi-format resume input** — PDF, DOCX, TXT, or paste directly
- **Smart claim extraction** — rule-based categorization, no API required
- **Adaptive interview engine** — follow-up questions triggered by vague answers
- **Real Defense Report** — dynamic scoring, strengths/weaknesses, and practice questions
- **100% client-side & private** — no backend, no login, your resume never leaves your browser
- **Built to extend** — the rule-based engine today is architected so a real LLM API can replace it later without a UI rewrite

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, and JavaScript (native ES modules) — no framework, no build step
- **Parsing:** [pdf.js](https://mozilla.github.io/pdf.js/) and [mammoth.js](https://github.com/mwilliamson/mammoth.js), loaded via CDN
- **Hosting:** GitHub Pages (free, static)
- **AI layer:** 100% rule-based JavaScript — no external API, no cost, no server

## Architecture

This project is fully client-side by design: no backend, no database, no authentication. All resume processing happens in your browser. Full technical documentation lives in [`docs/`](docs/), including:

- [`PRD.docx`](docs/PRD.docx) — Product Requirements Document
- [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system architecture, data flow, component diagrams
- [`SCHEMA.md`](docs/SCHEMA.md) — in-memory state schema
- [`API.md`](docs/API.md) — internal module API contracts
- [`UI-WIREFRAMES.md`](docs/UI-WIREFRAMES.md) — user flow and wireframes
- [`PROJECT-STRUCTURE.md`](docs/PROJECT-STRUCTURE.md) — folder structure and rationale
- [`QA-REPORT.md`](docs/QA-REPORT.md) — pre-launch QA and production-readiness review
- [`PROJECT-LOG.md`](docs/PROJECT-LOG.md) — day-by-day build log

## Running Locally

No installation or build step required.

```bash
git clone https://github.com/NashraRashid/defend-your-experience.git
cd defend-your-experience
```

Open `index.html` with a local server (e.g., the VS Code **Live Server** extension) — opening it directly as a `file://` URL will not work, since browsers block ES module imports over that protocol for security reasons.

## Future Scope (v2.0+)

- Live Claude/OpenAI API integration for fully generative, context-aware interviews
- Voice-based interview mode (speech-to-text / text-to-speech)
- Accounts with saved interview history over time
- Multi-resume / multi-role comparison
- Expansion beyond software engineering to other domains

## About

Built by [Nashra Rashid](https://github.com/NashraRashid) as a 10-day capstone project for the **AB Talks 60-Day Claude AI Challenge**.

## License

MIT — see [LICENSE](LICENSE).
