import { useEffect, useMemo, useRef, useState } from "react";
import type { MiniCrossword } from "./lib/types";
import Mini from "./Components/Mini";
import Timer from "./Components/Timer";
import Modal from "react-responsive-modal";
import posthog from "posthog-js";
import localforage from "localforage";
import type { AuthRecord } from "pocketbase";
import { pb } from "./main";
import { GlobalState } from "./lib/GlobalState";
import { Archive } from "./Components/Archive";
import { Button, ButtonGroup } from "rsuite";
import formatDate from "./lib/formatDate";

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
  const [archiveOpen, setArchiveOpen] = useState(false);
  const timeRef = useRef<number[]>([]);
  const startTouched = useRef(false);
  const stateDocId = useRef<string>("");

  const [user, setUser] = useState<AuthRecord | null>(pb.authStore.isValid ? pb.authStore.record : null);

  const globalState = useMemo(
    () => ({
      user,
      setUser,
      paused,
      data,
      setData
    }),
    [user, paused, data]
  );

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
    if (user) {
      posthog.identify(user.id, {
        username: user.username
      });
    }
  }, [user]);

  useEffect(() => {
    if (!data?.id) return;

    const restoreSave = async () => {
      setCloudLoading(true);

      if (pb.authStore.isValid && pb.authStore.record) {
        try {
          const record = await pb.collection("puzzle_state").getFirstListItem(`puzzle_id="${data.id}"`);
          console.log("Found cloud save:", record.id);
          console.log("Restored cloud time:", record.time);
          stateDocId.current = record.id;
          await Promise.all([
            localforage.setItem(`autocheck-${data.id}`, record.autocheck),
            localforage.setItem(`state-${data.id}`, record.board_state),
            localforage.setItem(`time-${data.id}`, record.time),
            localforage.setItem(`selected-${data.id}`, record.selected),
            localforage.setItem(`complete-${data.id}`, record.complete),
            localforage.setItem(`cheated-${data.id}`, record.cheated)
          ]);
          setRestoredTime(record.time ?? 0);
          setCloudLoading(false);
          return;
        } catch (err: any) {
          if (!err.toString().includes("404")) console.error(err);
        }
      }

      try {
        const localTime = await localforage.getItem<number>(`time-${data.id}`);
        setRestoredTime(typeof localTime === "number" ? localTime : 0);
        console.log("Restored local time:", localTime);
      } catch (err) {
        console.error(err);
        setRestoredTime(0);
      } finally {
        setCloudLoading(false);
      }
    };

    restoreSave();
  }, [data, user]);

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
          <h4>{formatDate(data.publicationDate)}</h4>
          <h4 style={{ marginBottom: 10 }}>by {data.constructors.join(", ")}</h4>
          <ButtonGroup vertical block>
            <Button
              onClick={() => {
                setModalOpen(false);
                posthog.capture(restoredTime > 0 ? "continue_puzzle" : "start_puzzle", { puzzle: data.id });
              }}
              onTouchStart={() => {
                startTouched.current = true;
                console.log("touch input detected");
              }}
              appearance="primary"
              loading={cloudLoading}
              disabled={cloudLoading}
            >
              {restoredTime > 0 ? "Continue Solving" : "Start Solving"}
            </Button>
            <Button
              onClick={() => {
                setArchiveOpen(true);
              }}
              appearance="default"
            >
              Archive
            </Button>
          </ButtonGroup>
        </Modal>
      )}
      <Archive open={archiveOpen} setOpen={setArchiveOpen} />
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
          <strong style={{ display: "block", textAlign: "center" }}>
            {timeRef.current[0]}:{timeRef.current[1].toString().padStart(2, "0")}
          </strong>
        ) : (
          ""
        )}
        <Button
          appearance="primary"
          onClick={() => {
            setPaused(false);
            posthog.capture("resume");
          }}
        >
          Resume
        </Button>
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
          stateDocId={stateDocId}
        />
      ) : (
        !data && !error && <div className="loading">Loading...</div>
      )}
      {error && <div className="error">{error}</div>}
    </GlobalState.Provider>
  );
}

export default App;
