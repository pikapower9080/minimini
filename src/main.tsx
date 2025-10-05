import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import posthog from "posthog-js";
import { PostHogProvider, PostHogErrorBoundary } from "posthog-js/react";
import { configureStorage } from "./lib/storage.ts";
import "react-toggle/style.css";

posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  defaults: "2025-05-24"
});

configureStorage();

createRoot(document.getElementById("root")!).render(
  <PostHogProvider client={posthog}>
    <PostHogErrorBoundary>
      <App />
    </PostHogErrorBoundary>
  </PostHogProvider>
);
