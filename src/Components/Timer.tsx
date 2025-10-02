import { faPause } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import posthog from "posthog-js";
import { useEffect } from "react";
import { useStopwatch } from "react-timer-hook";

interface TimerProps {
  onPause: () => void;
  running: boolean;
  setTime: (time: [number, number]) => void;
}

export default function Timer({ onPause, running, setTime }: TimerProps) {
  const {
    seconds,
    minutes,
    start,
    pause
  } = useStopwatch({ autoStart: true, interval: 20 });

  useEffect(() => {
    if (running) {
      start();
    } else {
      pause();
    }
  }, [running]);

  useEffect(() => {
    setTime([minutes, seconds]);
  }, [minutes, seconds]);

  return <div className="timer">
    <span className="timer-text">{minutes}:{seconds.toString().padStart(2, "0")}</span>
    <FontAwesomeIcon icon={faPause} className="timer-icon" onClick={() => {
      posthog.capture('manual_pause', {time: `${minutes}:${seconds.toString().padStart(2, "0")}`});
      onPause();
    }} />
  </div>;
}