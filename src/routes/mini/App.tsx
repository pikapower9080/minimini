import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "rsuite";
import posthog from "posthog-js";
import localforage from "localforage";
import { Button, ButtonGroup, Heading, VStack, Text } from "rsuite";
import { ArchiveIcon } from "lucide-react";

import type { MiniCrossword } from "@/lib/types";
import { GlobalState } from "@/lib/GlobalState";
import formatDate from "@/lib/formatting";
import { Archive } from "./Components/Archive";
import { MiniState } from "./state";
import { pb, pb_url } from "@/main";
import AccountButtons from "@/Components/AccountButtons";
import SignIn from "@/Components/SignIn";
import Friends from "@/Components/Friends";
import Account from "@/Components/Account";
import Mini from "./Components/Mini";
import Timer from "./Components/Timer";

function App({ type }: { type: "mini" | "crossword" }) {
  const [data, setData] = useState<MiniCrossword | null>(null);
  const [restoredTime, setRestoredTime] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [modalState, setModalState] = useState<"welcome" | "archive" | "sign-in" | "friends" | "account" | null>("welcome");
  const timeRef = useRef<number[]>([]);
  const startTouched = useRef(false);
  const stateDocId = useRef<string>("");

  const { user, setUser } = useContext(GlobalState);

  const miniState = useMemo(
    () => ({
      paused,
      data,
      setData,
      modalState,
      setModalState,
      type
    }),
    [user, paused, data, modalState, type]
  );

  useEffect(() => {
    fetch(pb_url + (type === "mini" ? "/api/today" : "/api/today/xwd"))
      .then((res) => res.json())
      .then((json) => {
        if (json.message && json.message === "Not Found") {
          setError(
            `${import.meta.env.DEV ? `Today's puzzle hasn't been archived yet.` : "Failed to load today's puzzle. Check back later."}`
          );
          return;
        }
        setData(json);
      })
      .catch((err) => {
        console.error(err);
        setError(`${import.meta.env.DEV ? `Failed to access the Pocketbase API at ${pb_url}` : "Failed to load today's puzzle."}`);
      });
  }, []);

  useEffect(() => {
    document.title = type === "mini" ? "The Mini Crossword - Glyph" : "The Daily - Glyph";
    document.getElementById("favicon-ico")?.setAttribute("href", `/icons/${type}/favicon.ico`);
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/${type}/favicon.svg`);
    document.getElementById("apple-touch-icon")?.setAttribute("href", `/icons/${type}/apple-touch-icon.png`);
    document.getElementById("site-manifest")?.setAttribute("href", `/pwa/${type}.webmanifest`);
  }, [type]);

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
          await pb.collection("users");
          console.log("Refreshed auth store");
          const record = await pb.collection("puzzle_state").getFirstListItem(`puzzle_id="${data.id}" && user="${pb.authStore.record.id}"`);
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
      if (modalState == null && !paused) {
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
    <MiniState.Provider value={miniState}>
      {data && restoredTime > -1 && (
        <Modal open={modalState === "welcome"} onClose={() => {}} centered overflow={false} size={"fit-content"}>
          <VStack spacing={10}>
            <VStack spacing={5}>
              <Heading level={2}>The {type === "mini" ? "Mini" : "Daily"} Crossword</Heading>
              <Heading level={3}>{formatDate(data.publicationDate)}</Heading>
              <Heading level={4}>by {data.constructors.join(", ")}</Heading>
            </VStack>
            <ButtonGroup vertical block>
              <Button
                onClick={() => {
                  setModalState(null);
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
                  setModalState("archive");
                  posthog.capture("open_archive");
                }}
                appearance="default"
                startIcon={<ArchiveIcon />}
              >
                Archive
              </Button>
            </ButtonGroup>
            <AccountButtons setModalState={setModalState} appearance="subtle" justified={true} />
          </VStack>
        </Modal>
      )}

      <Archive
        open={modalState === "archive"}
        setOpen={() => {
          setModalState("welcome");
        }}
      />

      <Modal
        open={paused}
        onClose={() => {
          setPaused(false);
        }}
        centered
        size="fit-content"
        overflow={false}
        className="pause-modal"
      >
        <VStack spacing={8}>
          <Heading level={2}>Paused</Heading>
          {timeRef.current.length === 2 ? (
            <Text weight="bold" className="pause-time block centered">
              {timeRef.current[0]}:{timeRef.current[1].toString().padStart(2, "0")}
            </Text>
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
        </VStack>
      </Modal>
      <SignIn
        open={modalState === "sign-in"}
        setOpen={() => {
          setModalState("welcome");
        }}
      />

      <Friends
        open={modalState === "friends"}
        setOpen={() => {
          setModalState("welcome");
        }}
      />

      <Account
        open={modalState === "account"}
        setOpen={() => {
          setModalState("welcome");
        }}
      />

      {data && restoredTime > -1 && modalState === null ? (
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
      {data && restoredTime > -1 && modalState === null ? (
        <Mini
          data={data}
          startTouched={startTouched.current}
          timeRef={timeRef}
          complete={complete}
          setComplete={setComplete}
          stateDocId={stateDocId}
        />
      ) : (
        !data && !error && <Text className="loading centered block"></Text>
      )}
      {error && <div className="error centered block">{error}</div>}
    </MiniState.Provider>
  );
}

export default App;
