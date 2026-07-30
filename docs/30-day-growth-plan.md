# 30-Day Growth Plan — Defend Your Experience

A realistic, one-milestone-per-day roadmap taking the v1.0 MVP toward the 3-month vision in `future-scope.md` (real LLM integration). Each day builds directly on the previous one. Skip a day if life happens — just pick up the next day when you're back; don't try to double up.

## Week 1: Foundation for Real AI Integration (Days 1-7)

- **Day 1:** Set up a free Anthropic API account (or confirm free-tier access) and generate an API key. Do NOT put it in client-side code yet — just get the key and read the API docs for the Messages endpoint.
- **Day 2:** Set up a free serverless function host (Cloudflare Workers free tier or Vercel free tier). Deploy a "hello world" function that returns a static JSON response — this is your future API proxy.
- **Day 3:** Extend the hello-world function to accept a POST request with a text body and echo it back. This proves the request/response plumbing works before any real AI logic touches it.
- **Day 4:** Store your API key as a server-side environment variable in your serverless platform (never in the repo). Modify the function to make a real Claude API call with a hardcoded test prompt and return the response.
- **Day 5:** Write a new `claimExtractorAI.js` module that calls your serverless function instead of running local regex — but don't wire it in yet, just get it returning real Claude-generated claims for a hardcoded resume string.
- **Day 6:** Add a feature flag (`USE_AI_ENGINE = true/false`) in `state.js` so you can toggle between the old rule-based engine and the new AI-powered one without deleting either.
- **Day 7:** Wire the flag into `screens.js` so claim extraction calls whichever engine is active. Test both modes against the same real resume and compare output quality.

## Week 2: AI-Powered Interview & Report (Days 8-14)

- **Day 8:** Design the Claude prompt for adaptive question generation — experiment in the Claude console first, not in code, until the output quality feels right.
- **Day 9:** Build `questionEngineAI.js` following the same interface as `questionEngine.js`, calling your serverless function.
- **Day 10:** Wire the AI question engine behind the same feature flag; test a full interview using real Claude-generated questions.
- **Day 11:** Design and test the Claude prompt for answer analysis (replacing the local heuristic `analyzeAnswer()`).
- **Day 12:** Build `reportEngineAI.js` with a prompt that generates the full Defense Report from the real conversation transcript.
- **Day 13:** Run a full end-to-end AI-powered session and compare the report quality directly against a rule-based session on the same resume.
- **Day 14:** Add basic error handling for API failures (rate limits, timeouts) with a graceful fallback to the rule-based engine if the API call fails — never leave the user stuck.

## Week 3: Cost Control & Polish (Days 15-21)

- **Day 15:** Add simple rate limiting to your serverless function (e.g., a request counter per IP, reset daily) to protect against runaway API costs.
- **Day 16:** Add a loading/progress indicator specifically for AI calls, since they'll be slower than the instant local engine.
- **Day 17:** Write a short in-app note (e.g., a small badge) indicating when "AI mode" is active vs. the free rule-based mode, so users understand the difference.
- **Day 18:** Stress-test with 5+ different real resumes in AI mode; log and fix any prompt-quality issues you find.
- **Day 19:** Update `docs/ARCHITECTURE.md` and `docs/API.md` to reflect the new dual-engine reality.
- **Day 20:** Update the README with the new AI-mode feature and instructions for anyone wanting to run their own serverless proxy.
- **Day 21:** Full regression pass on the original rule-based mode — make sure nothing broke while building the AI path.

## Week 4: Ship v1.1 (Days 22-30)

- **Day 22:** Deploy the serverless function to production and point the live app at it.
- **Day 23:** Test the live AI mode end-to-end on the deployed site.
- **Day 24:** Add IndexedDB-based local history (from `future-scope.md`'s 6-month plan, pulled forward) so users can see their last 3 sessions without a real backend yet.
- **Day 25:** Build a simple "compare to last time" view using that local history.
- **Day 26:** Full accessibility and security re-check on everything added this month (same rigor as Day 8 of the original build).
- **Day 27:** Update `docs/QA-REPORT.md` with a new review covering the AI-mode additions.
- **Day 28:** Record a short "v1.1 update" demo video/clip showing AI mode in action.
- **Day 29:** Tag and release v1.1.0 on GitHub with clear release notes describing what changed since v1.0.0.
- **Day 30:** Write a short LinkedIn/portfolio update post about shipping the AI-powered upgrade — a natural, authentic follow-up to the original launch post.

---

**A note on realism:** this plan assumes roughly the same 3-5 hours/day cadence as the original 10-day sprint. If your available time changes, stretch the plan rather than compress it — the whole point of this roadmap is that it's actually achievable, not aspirational.
