import localforage from "localforage";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import { useStopwatch } from "react-timer-hook";
import type { MiniCrossword } from "../../../lib/types";
import { HStack, Text } from "rsuite";
import { PauseIcon } from "lucide-react";

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
    <HStack className="timer" justifyContent={"center"} spacing={0}>
      <Text className="timer-text">
        {minutes}:{seconds.toString().padStart(2, "0")}
      </Text>
      <PauseIcon
        className="timer-icon"
        onClick={() => {
          posthog.capture("manual_pause", {
            time: `${minutes}:${seconds.toString().padStart(2, "0")}`,
            puzzle: puzzle.id,
            keyboardActivated: false
          });
          onPause();
        }}
      />
    </HStack>
  );
}
