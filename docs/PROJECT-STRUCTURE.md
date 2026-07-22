# Project Structure — Defend Your Experience

## 1. Complete Folder Structure

```
defend-your-experience/
├── index.html                    # Single entry point — all 5 screens live here as sections
├── README.md                     # Project overview, live link, setup instructions
├── LICENSE                       # MIT License
├── .gitignore
│
├── css/
│   ├── variables.css              # Design tokens: colors, spacing, typography scale
│   ├── reset.css                  # Base CSS reset
│   └── style.css                  # Global styles, component styles, screen layouts
│
├── js/
│   ├── main.js                    # App entry point — bootstraps and mounts the app
│   ├── state.js                   # Central app state object + getters/setters
│   │
│   ├── parsing/
│   │   └── resumeParser.js        # PDF/DOCX/TXT → plain text (Day 4)
│   │
│   ├── engine/
│   │   ├── claimExtractor.js      # Resume text → categorized claims (Day 5)
│   │   ├── questionEngine.js      # Claims → adaptive question queue (Day 6)
│   │   └── reportEngine.js        # Answers → Defense Report (Day 7)
│   │
│   ├── ui/
│   │   ├── screens.js             # Screen routing/show-hide logic
│   │   └── components.js          # Reusable UI builder functions (chat bubble, chip, etc.)
│   │
│   └── data/
│       └── questionTemplates.js   # Static question template library (Day 6)
│
├── assets/
│   └── (icons/images as needed — added on Day 3+)
│
└── docs/
    ├── PRD.md                     # (or .docx) — Day 1 deliverable
    ├── ARCHITECTURE.md            # This Day 2 deliverable
    ├── SCHEMA.md                  # This Day 2 deliverable
    ├── API.md                     # This Day 2 deliverable
    ├── UI-WIREFRAMES.md           # This Day 2 deliverable
    ├── PROJECT-STRUCTURE.md       # This document
    └── PROJECT-LOG.md             # Running daily log (started today)
```

---

## 2. Folder Responsibilities

### `css/`
Owns all visual styling. `variables.css` defines the design system as CSS custom properties (colors, spacing, font sizes) so the entire app's look can be adjusted from one file. `style.css` imports the tokens and implements actual component and layout styles. No JS file ever hardcodes a color or spacing value — everything references a CSS variable.

### `js/main.js` and `js/state.js`
`main.js` is the only file that runs on page load — it initializes `state.js` and shows the landing screen. `state.js` is the single source of truth for all session data (see SCHEMA.md); every other module reads from and writes to this one object, never to each other directly.

### `js/parsing/`
Owns the boundary between "external file" and "plain text the rest of the app can use." This is intentionally the only place that touches `File` objects, `FileReader`, pdf.js, or mammoth.js. Nothing downstream of this folder needs to know or care whether the original input was a PDF, DOCX, or pasted text.

### `js/engine/`
The three modules here are the "intelligence" of the app and the ones most likely to be replaced or extended in v2.0. Each is deliberately self-contained: `claimExtractor.js` never imports `questionEngine.js`, and neither imports `reportEngine.js`. They only communicate through `state.js`. This isolation is what makes a future LLM API swap safe — replacing one engine file cannot break another.

### `js/ui/`
Owns everything the user sees and interacts with. `screens.js` handles which of the 5 screens is currently visible and wires user actions (button clicks, form submits) to calls into `parsing/` and `engine/`. `components.js` holds small reusable builder functions (e.g., `createChatBubble()`, `createClaimChip()`) so screen markup stays DRY. Crucially, `ui/` contains **no business logic** — it never decides how to categorize a claim or score an answer, it only renders what `state.js` already contains.

### `js/data/`
Static, hand-authored content — the question template library. Kept separate from `engine/` because templates are *data* (content a non-engineer could edit), while `questionEngine.js` is *logic* (the code that selects and fills templates). This separation also makes it easy to expand templates later (e.g., for new domains in v2.0) without touching engine logic.

### `assets/`
Icons and images. Empty today; populated starting Day 3 as the design system is built out.

### `docs/`
Every planning and design deliverable lives here, permanently, inside the repo — not just delivered as chat downloads. This is what makes the repository itself a complete portfolio artifact: a recruiter or judge can open `docs/` and see the entire product-thinking process (PRD → Architecture → Schema → API → Wireframes) alongside the working code. `PROJECT-LOG.md` will track daily progress starting today.

---

## 3. Where Future Code Will Live (Day-by-Day Mapping)

| Day | What gets built | Where it lives |
|---|---|---|
| Day 3 | Design system + static screen shells | `css/*`, `index.html`, `js/ui/screens.js` (dummy nav only) |
| Day 4 | Resume input + parsing | `js/parsing/resumeParser.js`, `js/state.js` (new fields), `index.html` (real file input) |
| Day 5 | Claim extraction engine | `js/engine/claimExtractor.js`, claims summary UI in `js/ui/` |
| Day 6 | Adaptive interview engine | `js/engine/questionEngine.js`, `js/data/questionTemplates.js` |
| Day 7 | Defense report engine | `js/engine/reportEngine.js`, report screen in `js/ui/` |
| Day 8 | Polish, animations, edge cases | `css/style.css`, `js/ui/*` (refinement only, no new files) |
| Day 9 | Deployment + docs | `README.md`, deployment config, no new `js/` files |
| Day 10 | Launch content | `docs/CASE_STUDY.md` (new), `README.md` updated |

No day introduces a folder that isn't already defined above — the structure created today is complete and final for v1.0.

---

## 4. Why This Structure Was Chosen

1. **Separation of concerns mirrors the architecture diagram** (see ARCHITECTURE.md) exactly — `parsing/`, `engine/`, `ui/`, and `data/` map 1:1 to the four layers in the component diagram. Anyone reading the folder structure already understands the architecture.
2. **No build tools required** — native ES modules mean this structure works by opening `index.html` in a browser or deploying as-is to GitHub Pages, with zero configuration.
3. **Engine isolation protects the v2.0 upgrade path** — because `engine/` files only talk to `state.js`, replacing the rule-based engine with a real API later touches exactly one file at a time, never a cascade of changes.
4. **`docs/` as a first-class folder** turns the entire planning process into a visible, permanent portfolio asset — directly serving the Day 10 success criteria of a "complete, portfolio-ready project."
5. **Flat and shallow** — no folder nests more than 2 levels deep, keeping the project easy to navigate for both you and anyone reviewing the code (recruiters, mentors, other AI assistants picking up a fresh day).
