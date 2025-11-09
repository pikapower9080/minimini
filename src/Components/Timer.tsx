import { faPause } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import localforage from "localforage";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import { useStopwatch } from "react-timer-hook";
import type { MiniCrossword } from "../lib/types";

interface TimerProps {
  onPause: () => void;
  running: boolean;
  setTime: (time: [number, number]) => void;
  puzzle: MiniCrossword;
  restoredTime?: number;
}

export default function Timer({ onPause, running, setTime, puzzle, restoredTime }: TimerProps) {
  const restoredTimeDate = new Date();
  restoredTimeDate.setSeconds(restoredTimeDate.getSeconds() + (restoredTime || 0));
  const { seconds, minutes, start, pause, totalSeconds } = useStopwatch({
    autoStart: false,
    interval: 20,
    offsetTimestamp: restoredTimeDate
  });

  const [justPaused, setJustPaused] = useState(false);

  useEffect(() => {
    if (running) {
      start();
    } else {
      pause();
    }
  }, [running]);

  useEffect(() => {
    setTime([minutes, seconds]);
    localforage.setItem(`time-${puzzle.id}`, totalSeconds);
  }, [minutes, seconds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (justPaused) {
          setJustPaused(false);
          return;
        }
        if (e.repeat) return;
        e.preventDefault();
        onPause();
        setJustPaused(true);
      }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [onPause, justPaused]);

  return (
    <div className="timer">
      <span className="timer-text">
        {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
      <FontAwesomeIcon
        icon={faPause}
        className="timer-icon"
        onClick={() => {
          posthog.capture("manual_pause", { time: `${minutes}:${seconds.toString().padStart(2, "0")}`, puzzle: puzzle.id, keyboardActivated: false });
          onPause();
        }}
      />
    </div>
  );
}
