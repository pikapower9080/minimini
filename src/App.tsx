import { useEffect, useRef, useState } from "react";
import type { MiniCrossword } from "./lib/types";
import Mini from "./Components/Mini";
import Timer from "./Components/Timer";
import Modal from "react-responsive-modal";
import posthog from "posthog-js";
import localforage from "localforage";
import type { AuthRecord } from "pocketbase";
import { pb } from "./main";
import { GlobalState } from "./lib/GlobalState";
import { generateStateDocId } from "./lib/storage";

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

function App() {
  const [data, setData] = useState<MiniCrossword | null>(null);
  const [restoredTime, setRestoredTime] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(true);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const [cloudLoading, setCloudLoading] = useState(false);
  const timeRef = useRef<number[]>([]);
  const startTouched = useRef(false);
  const cloudSaveLoaded = useRef(false);

  const [user, setUser] = useState<AuthRecord | null>(pb.authStore.isValid ? pb.authStore.record : null);

  const globalState = {
    user,
    setUser
  };

  useEffect(() => {
    fetch(apiURL + "/api/today")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
      })
      .catch((err) => {
        console.error(err);
        setError(`${import.meta.env.DEV ? `Failed to access the API at ${apiURL}` : "Failed to load today's puzzle. "}`);
      });
  }, []);

  useEffect(() => {
    if (pb.authStore.isValid) {
      if (!pb?.authStore?.record || !data?.id) return;
      setCloudLoading(true);
      const puzzleState = pb.collection("puzzle_state");
      puzzleState
        .getOne(generateStateDocId(pb.authStore.record, data))
        .then((record) => {
          setRestoredTime(record.time);
          console.log("Restored cloud time: " + record.time);
          Promise.all([
            localforage.setItem(`autocheck-${data.id}`, record.autocheck),
            localforage.setItem(`state-${data.id}`, record.board_state),
            localforage.setItem(`time-${data.id}`, record.time),
            localforage.setItem(`selected-${data.id}`, record.selected)
          ]).finally(() => {
            cloudSaveLoaded.current = true;
            setCloudLoading(false);
          });
        })
        .catch((err) => {
          if (err.toString().includes("404")) {
            console.log("No cloud save found for this puzzle.");
          } else {
            console.error(err);
          }
          setCloudLoading(false);
        });
    }
  }, [user, data]);

  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        username: user.username
      });
    }
  }, [user]);

  useEffect(() => {
    if (data && data.id && !cloudSaveLoaded.current) {
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
            disabled={cloudLoading}
          >
            {cloudLoading ? "Loading..." : restoredTime > 0 ? "Continue Solving" : "Start Solving"}
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
        <Mini
          data={data}
          startTouched={startTouched.current}
          timeRef={timeRef}
          complete={complete}
          setComplete={setComplete}
          cloudSaveLoaded={cloudSaveLoaded}
        />
      ) : (
        !data && !error && <div className="loading">Loading...</div>
      )}
      {error && <div className="error">{error}</div>}
    </GlobalState.Provider>
  );
}

export default App;
