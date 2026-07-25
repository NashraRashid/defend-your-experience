// resumeParser.js
// Converts a resume, in whatever format the user gives us, into plain text.
// This is the ONLY file that touches File objects, pdf.js, or mammoth.js.
// Everything downstream just works with plain strings.

// pdf.js needs to know where its "worker" script lives (a background
// helper file it uses for performance). We point it at the same CDN
// version we loaded in index.html.
if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

const MIN_LENGTH = 100;

/**
 * Reads a PDF file and returns its text content.
 */
async function parsePdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText.trim();
}

/**
 * Reads a DOCX file and returns its text content.
 */
async function parseDocx(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

/**
 * Reads a plain .txt file and returns its text content.
 */
function parseTxt(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).trim());
    reader.onerror = () => reject(new Error("Could not read the text file."));
    reader.readAsText(file);
  });
}

/**
 * Figures out the file type and calls the right parser.
 * This is the single function the rest of the app should call.
 *
 * @param {File} file
 * @returns {Promise<string>} extracted plain text
 * @throws {{ code: string, message: string }}
 */
export async function parseResumeFile(file) {
  if (!file) {
    throw { code: "NO_FILE", message: "No file was selected." };
  }

  const name = file.name.toLowerCase();

  try {
    let text = "";

    if (name.endsWith(".pdf")) {
      text = await parsePdf(file);
    } else if (name.endsWith(".docx")) {
      text = await parseDocx(file);
    } else if (name.endsWith(".txt")) {
      text = await parseTxt(file);
    } else {
      throw {
        code: "UNSUPPORTED_FORMAT",
        message: "That file type isn't supported. Please upload a PDF, DOCX, or TXT file, or paste your resume text instead.",
      };
    }

    if (!text || text.length === 0) {
      throw {
        code: "EMPTY_FILE",
        message: "We couldn't find any text in that file. Try pasting your resume text instead.",
      };
    }

    return text;
  } catch (err) {
    // If it's already one of our friendly error objects, rethrow it as-is.
    if (err && err.code) throw err;

    // Otherwise it's an unexpected parsing failure (corrupt file, etc).
    console.error("Resume parsing failed:", err);
    throw {
      code: "PARSE_FAILED",
      message: "We couldn't read this file — it may be corrupted or in an unusual format. Try pasting your resume text instead.",
    };
  }
}

/**
 * Validates pasted resume text.
 *
 * @param {string} text
 * @returns {string} trimmed, validated text
 * @throws {{ code: string, message: string }}
 */
export function validatePastedText(text) {
  const trimmed = (text || "").trim();
  if (trimmed.length < MIN_LENGTH) {
    throw {
      code: "TEXT_TOO_SHORT",
      message: `Please enter at least ${MIN_LENGTH} characters so we have enough to work with (you have ${trimmed.length}).`,
    };
  }
  return trimmed;
}
