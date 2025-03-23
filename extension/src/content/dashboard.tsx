import React from "react";
import { createRoot } from "react-dom/client";
import { Dashboard } from "../components/Dashboard";
import "../popup.css"; // Make sure we have the styles

console.log("[dashboard] Starting dashboard script");

// Try tso find the mount hook
const mountHook = document.getElementById("mount-hook");

if (mountHook) {
  console.log("[dashboard] Mount hook found, rendering dashboard");

  // Create a container for our dashboard
  const dashboardContainer = document.createElement("div");
  mountHook.appendChild(dashboardContainer);

  // Render the dashboard into the container
  const root = createRoot(dashboardContainer);
  root.render(<Dashboard />);
} else {
  console.error(
    "[dashboard] Mount hook not found, creating fallback container"
  );
}
