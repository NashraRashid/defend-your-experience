// claimExtractor.js
// Reads resume text and pulls out structured, categorized claims.
// 100% rule-based JavaScript — no API calls, no external services,
// no cost. This is the exact interface a real LLM API would plug
// into later (same function name, same return shape) — see
// docs/API.md and docs/ARCHITECTURE.md Section 5.

const SECTION_HEADINGS = {
  projects: ["projects", "personal projects", "portfolio", "what i've built", "things i've built"],
  technicalSkills: ["skills", "technical skills", "tech stack", "technologies", "programming languages"],
  education: ["education", "academic background", "qualifications"],
  behavioral: ["experience", "leadership", "achievements", "certifications", "extracurricular", "activities", "internships"],
};

// Keyword dictionaries used when a line's section is unclear.
const TECH_KEYWORDS = [
  "javascript", "python", "java", "html", "css", "react", "node", "django",
  "bootstrap", "api", "sql", "database", "git", "github", "algorithm",
  "framework", "library", "cloud", "aws", "docker", "typescript", "flask",
];
const LEADERSHIP_KEYWORDS = [
  "led", "managed", "mentored", "organized", "founded", "coordinated",
  "supervised", "trained", "presented", "hosted", "volunteered",
];

const EMAIL_REGEX = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_REGEX = /(\+?\d[\d\s-]{8,}\d)/;

/**
 * Strips decorative separator runs like "----", "====", "____", "~~~~"
 * that resumes often use around section headings, so heading detection
 * works even when a heading is wrapped in dashes on the same line.
 */
function stripDecorativeSeparators(line) {
  return line.replace(/[-=_~*]{2,}/g, " ").trim();
}

/**
 * Returns true if a line looks like resume contact-info/header content
 * (name banner, email, phone, address) rather than an actual claim.
 */
function isHeaderOrContactLine(line, isFirstNonEmptyLine) {
  if (EMAIL_REGEX.test(line)) return true;
  if (PHONE_REGEX.test(line)) return true;
  if (isFirstNonEmptyLine && line.length < 80) return true; // name/title banner line
  if (/linkedin|github\.com\/(?!.*built)/i.test(line) && line.length < 100) return true;
  return false;
}

/**
 * Splits raw resume text into { sectionName: rawTextBlock } based on
 * heading keywords, tolerant of decorative dashes around the heading.
 */
function detectSections(text) {
  const rawLines = text.split("\n");
  const sections = {};
  let currentSection = "general";
  sections[currentSection] = [];
  let seenFirstLine = false;

  rawLines.forEach((rawLine) => {
    let trimmed = rawLine.trim();
    if (trimmed.length === 0) return;

    const isFirstNonEmptyLine = !seenFirstLine;
    seenFirstLine = true;

    // Skip header/contact-info lines entirely — never treat as a claim.
    if (isHeaderOrContactLine(trimmed, isFirstNonEmptyLine)) return;

    // Clean decorative separators before checking for a heading match.
    const cleaned = stripDecorativeSeparators(trimmed);
    const lower = cleaned.toLowerCase();

    if (cleaned.length > 0 && cleaned.length < 40) {
      const matchedCategory = Object.keys(SECTION_HEADINGS).find((cat) =>
        SECTION_HEADINGS[cat].some((keyword) => lower === keyword || lower.startsWith(keyword))
      );
      if (matchedCategory) {
        currentSection = matchedCategory;
        if (!sections[currentSection]) sections[currentSection] = [];
        return; // heading line itself is not content
      }
    }

    // Handle a heading embedded mid-line after separator-stripping,
    // e.g. original "Postman ------- PROJECTS ------- AI Interview..."
    // becomes "Postman PROJECTS AI Interview..." — check if a heading
    // keyword appears as a standalone word and split around it.
    const headingWordMatch = Object.keys(SECTION_HEADINGS).find((cat) =>
      SECTION_HEADINGS[cat].some((keyword) => {
        const re = new RegExp(`\\b${keyword}\\b`, "i");
        return re.test(cleaned) && cleaned.length < 120;
      })
    );
    if (headingWordMatch) {
      const keyword = SECTION_HEADINGS[headingWordMatch].find((kw) =>
        new RegExp(`\\b${kw}\\b`, "i").test(cleaned)
      );
      const idx = cleaned.toLowerCase().indexOf(keyword);
      const before = cleaned.slice(0, idx).trim();
      const after = cleaned.slice(idx + keyword.length).trim();

      if (before.length >= 8) sections[currentSection].push(before);
      currentSection = headingWordMatch;
      if (!sections[currentSection]) sections[currentSection] = [];
      if (after.length >= 8) sections[currentSection].push(after);
      return;
    }

    sections[currentSection].push(trimmed);
  });

  return sections;
}

/**
 * Splits a block of section text into individual candidate claim lines,
 * using bullet characters and newlines as separators.
 */
function splitIntoLines(sectionLines) {
  const combined = sectionLines.join("\n");
  return combined
    .split(/\n|•|(?<=\.)\s(?=[A-Z])/)
    .map((l) => stripDecorativeSeparators(l).replace(/^[-*•\s]+/, "").trim())
    .filter((l) => l.length >= 8 && !EMAIL_REGEX.test(l) && !PHONE_REGEX.test(l));
}

/**
 * Decides which category a claim line belongs to when the section
 * itself was ambiguous ("general").
 */
function categorizeClaim(line) {
  const lower = line.toLowerCase();
  const techHits = TECH_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  const leadershipHits = LEADERSHIP_KEYWORDS.filter((kw) => lower.includes(kw)).length;

  if (leadershipHits > 0) return "behavioral";
  if (techHits > 0) return "technicalSkills";
  return "projects";
}

/**
 * Main export. Takes raw resume text, returns categorized claims.
 *
 * @param {string} resumeText
 * @returns {{ technicalSkills: string[], projects: string[], education: string[], behavioral: string[] }}
 */
export function extractClaims(resumeText) {
  const claims = {
    technicalSkills: [],
    projects: [],
    education: [],
    behavioral: [],
  };

  if (!resumeText || resumeText.trim().length === 0) {
    return claims;
  }

  const sections = detectSections(resumeText);

  Object.entries(sections).forEach(([sectionName, sectionLines]) => {
    const candidateLines = splitIntoLines(sectionLines);

    candidateLines.forEach((line) => {
      const claimText = line.length > 140 ? line.slice(0, 140).trim() + "..." : line;

      if (sectionName === "projects") {
        claims.projects.push(claimText);
      } else if (sectionName === "technicalSkills") {
        if (claimText.includes(",") && claimText.split(",").length > 2) {
          claimText.split(",").forEach((skill) => {
            const s = skill.trim();
            if (s.length >= 2 && s.length <= 40) claims.technicalSkills.push(s);
          });
        } else if (claimText.split(" ").length <= 6) {
          // Short lines in a skills section are almost always actual skill
          // names, not full sentences — keep these as-is.
          claims.technicalSkills.push(claimText);
        }
        // Longer sentences in a skills section (e.g. "Passionate about...")
        // are usually intro fluff, not a specific defensible claim — skip.
      } else if (sectionName === "education") {
        claims.education.push(claimText);
      } else if (sectionName === "behavioral") {
        claims.behavioral.push(claimText);
      } else {
        const category = categorizeClaim(claimText);
        claims[category].push(claimText);
      }
    });
  });

  Object.keys(claims).forEach((key) => {
    claims[key] = [...new Set(claims[key])].slice(0, 8);
  });

  return claims;
}

/**
 * Returns true if extraction found essentially nothing usable,
 * so the UI can prompt the user to try pasting more detail.
 */
export function hasNoUsableClaims(claims) {
  return (
    claims.technicalSkills.length === 0 &&
    claims.projects.length === 0 &&
    claims.education.length === 0 &&
    claims.behavioral.length === 0
  );
}
