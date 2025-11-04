import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import posthog from "posthog-js";
import { PostHogProvider, PostHogErrorBoundary } from "posthog-js/react";
import { configureStorage } from "./lib/storage.ts";
import PocketBase from "pocketbase";
import "@szhsin/react-menu/dist/core.css";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";
import "rsuite/Toggle/styles/index.css";
import "rsuite/Rate/styles/index.css";
import "rsuite/Text/styles/index.css";
import "rsuite/Loader/styles/index.css";
import "react-responsive-modal/styles.css";
import "react-simple-keyboard/build/css/index.css";

import "./App.css";

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

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
