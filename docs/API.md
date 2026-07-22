# API Design — Defend Your Experience

## Important note on scope

This project has **no backend server**, so there are no HTTP REST endpoints in the traditional sense. This is a deliberate v1.0 architectural decision (PRD Section 9) to keep the app fully client-side, free to host, and private by design.

What this document provides instead is the **internal module API** — the exact function "contracts" between the UI layer and the three engine modules (`parsing`, `claimExtractor`, `questionEngine`, `reportEngine`). These function signatures serve the same purpose an API spec would: they are the fixed interface every other part of the app is built against, and the exact interface a v2.0 real-LLM-API swap would need to preserve.

Each entry below is written in REST-inspired shape (Purpose / Request / Response / Validation / Auth / Errors) even though it's a function call, not an HTTP call — so the structure translates directly to a real API if v2.0 introduces one.

---

## Module 1: `resumeParser.js`

### `parseResumeFile(file)`
- **Purpose:** Convert an uploaded PDF/DOCX/TXT file into plain text.
- **Request (input):** `File` object (from `<input type="file">`)
- **Response (output):** `Promise<string>` — resolves to extracted plain text
- **Validation:** File type must be `.pdf`, `.docx`, or `.txt`; file must not be empty
- **Authentication:** None (no backend)
- **Error cases:**
  - Unsupported file type → rejects with `{ code: "UNSUPPORTED_FORMAT", message: "..." }`, UI shows friendly fallback prompting paste
  - Corrupt/unreadable file → rejects with `{ code: "PARSE_FAILED", message: "..." }`
  - Empty file → rejects with `{ code: "EMPTY_FILE", message: "..." }`

### `parsePastedText(text)`
- **Purpose:** Validate and pass through user-pasted resume text.
- **Request:** `string`
- **Response:** `string` (trimmed, validated text) or throws
- **Validation:** Minimum 100 characters
- **Authentication:** None
- **Error cases:** Text under 100 characters → `{ code: "TEXT_TOO_SHORT" }`

---

## Module 2: `claimExtractor.js`

### `extractClaims(resumeText)`
- **Purpose:** Parse raw resume text into structured, categorized claims.
- **Request:** `string` (resumeText from state)
- **Response:**
  ```javascript
  {
    technicalSkills: [string],
    projects: [string],
    education: [string],
    behavioral: [string]
  }
  ```
- **Validation:** Input must be non-empty string ≥ 100 characters (already enforced upstream by `resumeParser.js`, re-checked defensively here)
- **Authentication:** None
- **Error cases:**
  - No sections detected and no bullet-like lines found → returns all-empty category arrays; UI shows a "we couldn't find much — try pasting more detail" message rather than throwing (graceful degradation, not a hard failure)

---

## Module 3: `questionEngine.js`

### `buildInterviewQueue(claims)`
- **Purpose:** Generate a personalized, ordered list of interview questions from extracted claims.
- **Request:** `claims` object (as returned by `extractClaims`)
- **Response:**
  ```javascript
  [
    {
      id: string,
      category: string,
      claimText: string,
      questionText: string,
      isFollowUp: false
    },
    ...
  ]
  ```
- **Validation:** At least one non-empty category array required; queue capped at 6–8 questions
- **Authentication:** None
- **Error cases:** All claim categories empty → returns an empty array; UI redirects user back to input screen with a message rather than starting an empty interview

### `analyzeAnswer(answerText)`
- **Purpose:** Classify the quality/specificity of a user's answer to decide on follow-up branching.
- **Request:** `string` (user's typed answer)
- **Response:** `"vague" | "adequate" | "strong"`
- **Validation:** Empty/whitespace-only answer treated as `"vague"` by default (not an error — the user may simply not know)
- **Authentication:** None
- **Error cases:** None — this function always returns a valid classification, never throws

### `getFollowUpQuestion(claim)`
- **Purpose:** Retrieve a probe question when `analyzeAnswer()` returns `"vague"`.
- **Request:** the current claim object
- **Response:** `string` (follow-up question text)
- **Validation:** N/A
- **Authentication:** None
- **Error cases:** No matching follow-up template for category → falls back to a generic probe ("Can you be more specific?")

---

## Module 4: `reportEngine.js`

### `generateReport(answersLog, claims)`
- **Purpose:** Aggregate the full interview session into the final Defense Report.
- **Request:**
  - `answersLog`: array of `{ questionText, answerText, analysis }`
  - `claims`: the original claims object (for cross-referencing which claims were never asked about, if any)
- **Response:**
  ```javascript
  {
    score: number,           // 0-100
    strengths: [string],
    weaknesses: [string],
    feedback: string,
    suggestions: [string],
    practiceQuestions: [string]
  }
  ```
- **Validation:** `answersLog` must contain at least 1 entry
- **Authentication:** None
- **Error cases:** Empty `answersLog` → throws `{ code: "NO_ANSWERS_RECORDED" }`; UI should never be able to reach the report screen with zero answers, so this is a defensive guard, not an expected path

### `exportReportAsText(report)`
- **Purpose:** Serialize the report object into a downloadable plain-text (or simple HTML) file.
- **Request:** `report` object
- **Response:** `string` (formatted text ready for `Blob` download)
- **Validation:** N/A
- **Authentication:** None
- **Error cases:** None

---

## v2.0 Forward Compatibility Note

If a real backend + LLM API is introduced in v2.0, `extractClaims()`, `buildInterviewQueue()`, `analyzeAnswer()`, and `generateReport()` would each become `async` wrappers around a `fetch()` call to a real endpoint (e.g., `POST /api/extract-claims`), but their **input parameters and returned object shapes would stay identical** to what's documented above. This is the entire point of documenting them as an "API" today — the UI layer never needs to change when the backend is introduced later.
