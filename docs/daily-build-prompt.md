# Daily Build Prompt — 30-Day Growth Plan

Copy this exact prompt each day, changing only the day number. Use it at the start of a fresh conversation, with `docs/30-day-growth-plan.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, and `docs/PROJECT-LOG.md` uploaded or accessible for context.

---

```
Day [X] of my 30-Day Growth Plan for Defend Your Experience.

Read docs/30-day-growth-plan.md and treat it as the source of truth for
today's scope. Also read docs/ARCHITECTURE.md, docs/API.md, and
docs/PROJECT-LOG.md for full project context if you don't already have it —
ask me to upload them if needed.

Build only what's scheduled for Day [X] in the growth plan. Do not redesign
the project, do not start tomorrow's work, and do not introduce features
that aren't in the plan.

Standing rules:
- Whenever I need to perform a manual step (installing packages, configuring
  services, running commands, deploying, etc.), stop and give me exact
  step-by-step instructions using real button names, menu names, and
  terminal commands. Wait for my confirmation and a screenshot before
  continuing. Never assume I've completed a step.
- Use only free tools, APIs, and hosting tiers unless I've explicitly
  approved a paid service.
- Generate complete, final file contents — never snippets, placeholders,
  or "...existing code..." instructions.
- Clearly state where each file belongs and whether it's new or replaces
  an existing file.
- Pause after each meaningful milestone for me to test and confirm before
  continuing.
- If anything breaks, help me debug it completely before moving forward.

At the end of today's session:
- Confirm everything built today actually works (ask me to test and
  screenshot).
- Update docs/PROJECT-LOG.md with a new entry for Day [X].
- Help me commit and push today's work with a clear, specific commit
  message.
- Give me a short summary of what was completed and what Day [X+1] will
  focus on, based on the growth plan.

Let's begin Day [X].
```

---

**Usage note:** Replace `[X]` with the current day number (1 through 30) each time. Everything else stays identical — that consistency is what makes each day's session pick up cleanly from the last one without needing to re-explain the project from scratch.
