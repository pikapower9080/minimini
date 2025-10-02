import { useEffect, useRef, useState } from "react";
import "./App.css";
import type { MiniCrossword } from "./lib/types";
import Mini from "./Components/Mini";
import Timer from "./Components/Timer";
import Modal from "react-responsive-modal";
import posthog from "posthog-js";

function App() {
  const [data, setData] = useState<MiniCrossword | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(true);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const timeRef = useRef<number[]>([]); // Use useRef instead of useState
  const startTouched = useRef(false);

  useEffect(() => {
    const cached = localStorage.getItem("mini-cache");
    const cachedDate = localStorage.getItem("mini-cache-date");
    const today = new Date().toISOString().split("T")[0];

    if (cached && cachedDate && cachedDate.split("T")[0] === today) {
      setData(JSON.parse(cached));
      return;
    }
    fetch("https://miniminicw.vercel.app/api/today")
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
    const handleBlur = () => {
      console.log("focus lost");
      if (data && !modalOpen && !paused) {
        if (complete) return;
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
    <>
      {data && (
        <Modal open={modalOpen} onClose={() => {}} showCloseIcon={false} center classNames={{ modal: "welcome-modal" }}>
          <h2>Welcome to minimini</h2>
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
            }}
            onTouchStart={() => {
              startTouched.current = true;
              console.log("touch input detected");
            }}
          >
            Start Solving
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
      {data && !modalOpen ? (
        <Timer
          onPause={() => {
            if (complete) return;
            setPaused(true);
          }}
          running={!paused && !complete}
          setTime={(time) => {
            timeRef.current = time;
          }}
        />
      ) : (
        ""
      )}
      {data && !modalOpen ? (
        <Mini data={data} startTouched={startTouched.current} timeRef={timeRef} complete={complete} setComplete={setComplete} />
      ) : (
        !data && !error && <div className="loading">Loading...</div>
      )}
      {error && <div className="error">{error}</div>}
    </>
  );
}

export default App;
