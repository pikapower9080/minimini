import { createContext, useEffect, useRef, useState } from "react";
import "./App.css";
import type { MiniCrossword } from "./lib/types";
import Mini from "./Components/Mini";
import Timer from "./Components/Timer";
import Modal from "react-responsive-modal";
import posthog from "posthog-js";
import localforage from "localforage";
import type { AuthRecord } from "pocketbase";
import { pb } from "./main";

let apiURL = "";
let apiURLSource = "production";

if (!import.meta.env.PROD) {
  apiURL = "http://localhost:3000";
  apiURLSource = "development default";
}
if (import.meta.env.VITE_API_URL) {
  apiURL = import.meta.env.VITE_API_URL;
  apiURLSource = "environment variable";
}
if (apiURL !== "") {
  console.log(`API URL (from ${apiURLSource}): ${apiURL}`);
}

export const GlobalState = createContext<any>(null);

function App() {
  const [data, setData] = useState<MiniCrossword | null>(null);
  const [restoredTime, setRestoredTime] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(true);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const timeRef = useRef<number[]>([]); // Use useRef instead of useState
  const startTouched = useRef(false);

  const [user, setUser] = useState<AuthRecord | null>(pb.authStore.isValid ? pb.authStore.record : null);

  const globalState = {
    user,
    setUser
  };

  useEffect(() => {
    const cached = localStorage.getItem("mini-cache");
    const cachedDate = localStorage.getItem("mini-cache-date");

    if (cached && cachedDate) {
      const cachedTime = new Date(cachedDate).getTime();
      const now = new Date().getTime();
      const tenMinutes = 10 * 60 * 1000;

      if (now - cachedTime < tenMinutes) {
        setData(JSON.parse(cached));
        return;
      }
    }
    fetch(apiURL + "/api/today")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        localStorage.setItem("mini-cache", JSON.stringify(json));
        localStorage.setItem("mini-cache-date", new Date().toISOString());
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load today's puzzle.");
      });
  }, []);

  useEffect(() => {
    if (data && data.id) {
      localforage
        .getItem(`time-${data.id}`)
        .then((value) => {
          if (value && typeof value === "number") {
            setRestoredTime(value);
          } else {
            setRestoredTime(0);
          }
        })
        .catch((err) => {
          console.error(err);
          setRestoredTime(0);
        });
    }
  }, [data]);

  useEffect(() => {
    const handleBlur = () => {
      console.log("focus lost");
      if (data && !modalOpen && !paused) {
        if (complete) return;
        if (import.meta.env.VITE_AUTO_PAUSE === "false") return;
        posthog.capture("auto_pause", {
          time: `${timeRef.current.length === 2 ? timeRef.current[0] + ":" + timeRef.current[1].toString().padStart(2, "0") : ""}`
        });
        setPaused(true);
      }
    };

    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  });

  return (
    <GlobalState.Provider value={globalState}>
      {data && restoredTime > -1 && (
        <Modal open={modalOpen} onClose={() => {}} showCloseIcon={false} center classNames={{ modal: "welcome-modal" }}>
          <h2>{restoredTime > 0 ? "Welcome back!" : "Welcome to minimini"}</h2>
          <h4>
            {new Date(data.publicationDate + "T00:00:00")
              .toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
              .replace(/\b(\d{1,2})\b/, (match) => {
                const suffix = ["th", "st", "nd", "rd"];
                const day = parseInt(match, 10);
                const value = day % 100;
                return day + (suffix[(value - 20) % 10] || suffix[value] || suffix[0]);
              })}
          </h4>
          <h4>by {data.constructors.join(", ")}</h4>
          <button
            onClick={() => {
              setModalOpen(false);
              posthog.capture(restoredTime > 0 ? "continue_puzzle" : "start_puzzle", { puzzle: data.id });
            }}
            onTouchStart={() => {
              startTouched.current = true;
              console.log("touch input detected");
            }}
          >
            {restoredTime > 0 ? "Continue Solving" : "Start Solving"}
          </button>
        </Modal>
      )}
      <Modal
        open={paused}
        onClose={() => {
          setPaused(false);
        }}
        center
        classNames={{ modal: "pause-modal", overlay: "pause-modal-container" }}
        showCloseIcon={false}
      >
        <h2>Paused</h2>
        {timeRef.current.length === 2 ? (
          <strong>
            {timeRef.current[0]}:{timeRef.current[1].toString().padStart(2, "0")}
          </strong>
        ) : (
          ""
        )}
        <button
          onClick={() => {
            setPaused(false);
            posthog.capture("resume");
          }}
        >
          Resume
        </button>
      </Modal>
      {data && restoredTime > -1 && !modalOpen ? (
        <Timer
          onPause={() => {
            if (complete) return;
            setPaused(true);
          }}
          running={!paused && !complete}
          setTime={(time) => {
            timeRef.current = time;
          }}
          puzzle={data}
          restoredTime={restoredTime}
        />
      ) : (
        ""
      )}
      {data && restoredTime > -1 && !modalOpen ? (
        <Mini data={data} startTouched={startTouched.current} timeRef={timeRef} complete={complete} setComplete={setComplete} />
      ) : (
        !data && !error && <div className="loading">Loading...</div>
      )}
      {error && <div className="error">{error}</div>}
    </GlobalState.Provider>
  );
}

export default App;
