import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";

const rootEl = document.getElementById("root")!;

createRoot(rootEl).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
