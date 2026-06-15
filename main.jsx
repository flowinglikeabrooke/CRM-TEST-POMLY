import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PomlyCRM from "./App.jsx";

// Shim: artifact's window.storage -> localStorage, so saving works on the live site.
if (!window.storage) {
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(key);
      return value == null ? null : { key, value };
    },
    async set(key, value) {
      localStorage.setItem(key, value);
      return { key, value };
    },
    async delete(key) { localStorage.removeItem(key); return { key, deleted: true }; },
  };
}

createRoot(document.getElementById("root")).render(
  <StrictMode><PomlyCRM /></StrictMode>
);
