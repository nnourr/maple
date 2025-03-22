import { createRoot } from "react-dom/client";
import { Dashboard } from "../components/Dashboard";

const mountHook = document.getElementById("mount-hook");
if (!mountHook) {
  throw new Error("[content] Mount hook not found");
}
const root = createRoot(mountHook);
root.render(<Dashboard />);
