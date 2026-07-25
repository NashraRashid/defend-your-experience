import { initNavigation, showScreen } from "./ui/screens.js";

// Day 3 scope: bootstrap the app and wire up dummy click-through
// navigation between the 5 static screens. Real parsing/engine
// logic is connected starting Day 4.

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  showScreen("screen-landing");
});
