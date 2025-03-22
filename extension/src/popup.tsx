import React from "react";
import { createRoot } from "react-dom/client";
import Popup from "./components/Popup";
import "./popup.css";

console.log("[popup] Script loaded");

document.addEventListener("DOMContentLoaded", () => {
  console.log("[popup] DOMContentLoaded event fired");
  const container = document.getElementById("root");
  console.log("[popup] Root container found:", !!container);
  if (container) {
    const root = createRoot(container);
    console.log("[popup] Rendering Popup component");
    root.render(<Popup />);
  }
});
