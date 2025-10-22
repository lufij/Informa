
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('SW registrado:', registration.scope);
        })
        .catch(error => {
          console.error('Error al registrar SW:', error);
        });
    });
  }

  createRoot(document.getElementById("root")!).render(<App />);
  