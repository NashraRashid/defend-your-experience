import { initNavigation, showScreen } from "./ui/screens.js";

// Global error boundary: if anything unexpected throws during init or
// afterward, show a plain-language fallback instead of leaving the
// user staring at a silently broken page with no explanation.
window.addEventListener("error", (event) => {
  console.error("Unhandled error:", event.error || event.message);
  showFallbackError();
});
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

function showFallbackError() {
  if (document.getElementById("fatal-error-banner")) return; // don't stack multiple
  const banner = document.createElement("div");
  banner.id = "fatal-error-banner";
  banner.setAttribute("role", "alert");
  banner.style.cssText =
    "position:fixed;bottom:16px;left:16px;right:16px;max-width:480px;margin:0 auto;background:#F87171;color:#1B1300;padding:14px 18px;border-radius:12px;font-family:sans-serif;font-size:14px;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,0.4);";
  banner.textContent =
    "Something went wrong. Try refreshing the page — your resume data stays private and local either way.";
  document.body.appendChild(banner);
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    initNavigation();
    showScreen("screen-landing");
  } catch (err) {
    console.error("App failed to initialize:", err);
    showFallbackError();
  }
});
