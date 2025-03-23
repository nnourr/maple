import React from "react";
import { createRoot } from "react-dom/client";
import Marketplace from "../components/Marketplace";
import "../popup.css"; // Import styles

console.log("[marketplace] Starting marketplace script");

// Try to find the mount hook
const mountHook = document.getElementById("mount-hook");

if (mountHook) {
  console.log("[marketplace] Mount hook found, rendering marketplace");

  // Create a container for our marketplace
  const marketplaceContainer = document.createElement("div");
  mountHook.appendChild(marketplaceContainer);

  // Render the marketplace into the container
  const root = createRoot(marketplaceContainer);
  root.render(<Marketplace />);
} else {
  console.error(
    "[marketplace] Mount hook not found, creating fallback container"
  );

  // Create a fallback container if mount-hook doesn't exist
  const container = document.createElement("div");
  container.id = "extension-marketplace-container";
  container.style.margin = "20px auto";
  container.style.maxWidth = "800px";
  container.style.padding = "20px";

  // Add it to the body
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<Marketplace />);
} 