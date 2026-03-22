import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "@fontsource/inter"; // Carga el peso por defecto (400)
import "@fontsource/inter/700.css"; // Si necesitas negritas

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
