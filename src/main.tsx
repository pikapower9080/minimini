import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import posthog from "posthog-js";
import { PostHogProvider, PostHogErrorBoundary } from "posthog-js/react";
import { configureStorage } from "./lib/storage.ts";
import PocketBase from "pocketbase";
import "@szhsin/react-menu/dist/core.css";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";
import "react-simple-keyboard/build/css/index.css";
import "react-responsive-modal/styles.css";

import "rsuite/Toggle/styles/index.css";
import "rsuite/Rate/styles/index.css";
import "rsuite/Text/styles/index.css";
import "rsuite/Loader/styles/index.css";
import "rsuite/Calendar/styles/index.css";
import "rsuite/Badge/styles/index.css";
import "rsuite/ButtonGroup/styles/index.css";
import "rsuite/Button/styles/index.css";
import "rsuite/Input/styles/index.css";
import "rsuite/Table/styles/index.css";
import "rsuite/Checkbox/styles/index.css";
import "rsuite/List/styles/index.css";
import "rsuite/Stack/styles/index.css";
import "rsuite/Heading/styles/index.css";
import "rsuite/PinInput/styles/index.css";
import "rsuite/PasswordInput/styles/index.css";
import "rsuite/InputGroup/styles/index.css";

import "./css/App.css";

export const pb_url = import.meta.env.VITE_POCKETBASE_URL || location.origin;

export const pb = new PocketBase(pb_url);

if (import.meta.env.DEV) {
  // @ts-ignore
  window.pb = pb;
}

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
