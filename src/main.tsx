import { createRoot } from "react-dom/client";
import "./i18n/config";
import { bootstrapGeneratedSiteAnalytics } from "./analytics.ts";
import App from "./App.tsx";
import "./index.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container #root was not found.");
}

// Always start a fresh page load at the top instead of restoring the last
// scroll position from the browser.
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const scrollToTop = () => {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previousBehavior;
};

scrollToTop();
window.addEventListener("pageshow", scrollToTop);

bootstrapGeneratedSiteAnalytics();

createRoot(container).render(<App />);
