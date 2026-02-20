import { createRoot } from "react-dom/client";
import posthog from "posthog-js";
import { PostHogProvider, PostHogErrorBoundary } from "posthog-js/react";
import PocketBase, { type AuthRecord } from "pocketbase";
import { CustomProvider } from "rsuite";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Suspense, lazy, useState } from "react";

import { configureStorage } from "@/lib/storage.ts";
import { GlobalState } from "@/lib/GlobalState.ts";

import "@szhsin/react-menu/dist/core.css";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";
import "react-simple-keyboard/build/css/index.css";

import "rsuite/Animation/styles/index.css";
import "rsuite/Toggle/styles/index.css";
import "rsuite/Rate/styles/index.css";
import "rsuite/Text/styles/index.css";
import "rsuite/Loader/styles/index.css";
import "rsuite/Calendar/styles/index.css";
import "rsuite/Badge/styles/index.css";
import "rsuite/ButtonGroup/styles/index.css";
import "rsuite/Button/styles/index.css";
import "rsuite/IconButton/styles/index.css";
import "rsuite/Input/styles/index.css";
import "rsuite/Table/styles/index.css";
import "rsuite/Checkbox/styles/index.css";
import "rsuite/List/styles/index.css";
import "rsuite/Stack/styles/index.css";
import "rsuite/Heading/styles/index.css";
import "rsuite/PinInput/styles/index.css";
import "rsuite/PasswordInput/styles/index.css";
import "rsuite/InputGroup/styles/index.css";
import "rsuite/Avatar/styles/index.css";
import "rsuite/Box/styles/index.css";
import "rsuite/Modal/styles/index.css";
import "rsuite/Card/styles/index.css";
import "rsuite/CardGroup/styles/index.css";
import "rsuite/Image/styles/index.css";
import "rsuite/Center/styles/index.css";
import "rsuite/toaster/styles/index.css";
import "rsuite/useToaster/styles/index.css";
import "rsuite/Notification/styles/index.css";
import "rsuite/Tooltip/styles/index.css";
import "rsuite/Divider/styles/index.css";

import "./css/App.css";
import "./css/Index.css";
import "./css/Cascades.css";
import "./css/rsuite-reset.css";

const Index = lazy(() => import("./Index.tsx"));
const Mini = lazy(() => import("./routes/mini/App.tsx"));
const Cascades = lazy(() => import("./routes/cascades/App.tsx"));

export const pb_url = import.meta.env.VITE_POCKETBASE_URL || location.origin;

export const pb = new PocketBase(pb_url);

if (import.meta.env.DEV) {
  // @ts-ignore
  window.pb = pb;
}

if (import.meta.env.VITE_PUBLIC_POSTHOG_KEY && import.meta.env.VITE_PUBLIC_POSTHOG_HOST) {
  posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
    defaults: "2025-05-24"
  });
}

configureStorage();

function Main() {
  const [user, setUser] = useState<AuthRecord | null>(pb.authStore.isValid ? pb.authStore.record : null);

  const globalState = {
    user,
    setUser
  };

  return (
    <GlobalState.Provider value={globalState}>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/mini" element={<Mini type={"mini"} />} />
            <Route path="/crossword" element={<Navigate to="/daily" replace />} />
            <Route path="/daily" element={<Mini type={"crossword"} />} />
            <Route path="/cascades" element={<Cascades />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </GlobalState.Provider>
  );
}

createRoot(document.getElementById("root")!).render(
  <PostHogProvider client={posthog}>
    <PostHogErrorBoundary>
      <CustomProvider>
        <Main />
      </CustomProvider>
    </PostHogErrorBoundary>
  </PostHogProvider>
);
