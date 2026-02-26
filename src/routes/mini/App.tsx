import localforage from "localforage";
import { ArchiveIcon, ArrowLeftIcon, ChartNoAxesColumnIcon, InfoIcon, StarIcon } from "lucide-react";
import posthog from "posthog-js";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button, ButtonGroup, Center, Checkbox, CheckboxGroup, Heading, Modal, Text, Tooltip, useDialog, VStack, Whisper } from "rsuite";

import Account from "@/Components/Account";
import AccountButtons from "@/Components/AccountButtons";
import Friends from "@/Components/Friends";
import SignIn from "@/Components/SignIn";
import { GlobalState } from "@/lib/GlobalState";
import formatDate from "@/lib/formatting";
import type { MiniCrossword } from "@/lib/types";
import { pb, pb_url } from "@/main";
import { Archive } from "./Components/Archive";
import Mini from "./Components/Mini";
import Timer from "./Components/Timer";
import { MiniState } from "./state";
import { useNavigate } from "react-router";
import { Stats } from "./Components/Stats";

function App({ type }: { type: "mini" | "crossword" }) {
  const [data, setData] = useState<MiniCrossword | null>(null);
  const [restoredTime, setRestoredTime] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [options, setOptions] = useState<(string | number)[]>([]);
  const [modalState, setModalState] = useState<"welcome" | "archive" | "sign-in" | "friends" | "account" | "stats" | null>("welcome");

  const timeRef = useRef<number[]>([]);
  const startTouched = useRef(false);
  const stateDocId = useRef<string>("");
  const dialog = useDialog();
  const navigate = useNavigate();

  const { user, setUser } = useContext(GlobalState);

  const miniState = useMemo(
    () => ({
      paused,
      data,
      setData,
      modalState,
      setModalState,
      type,
      options
    }),
    [user, paused, data, modalState, type, options]
  );

  function pause() {
    if (options.includes("hardcore")) return;
    if (complete) return;
    setPaused(true);
  }

  useEffect(() => {
    fetch(pb_url + (type === "mini" ? "/api/today" : "/api/today/xwd"))
      .then((res) => res.json())
      .then((json) => {
        if (json.error && json.error === "Not Found") {
          setError("Failed to load today's puzzle.");
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
          await pb.collection("users").authRefresh();
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
        if (options.includes("hardcore")) {
          setOptions((prev) => prev.filter((opt) => opt !== "hardcore"));
          posthog.capture("hardcore_invalidate");
          dialog.alert("Hardcore mode was invalidated because you left the tab. You can still continue in normal mode.");
        }
        if (import.meta.env.VITE_AUTO_PAUSE === "false") return;
        posthog.capture("auto_pause", {
          time: `${timeRef.current.length === 2 ? timeRef.current[0] + ":" + timeRef.current[1].toString().padStart(2, "0") : ""}`
        });
        pause();
      }
    };

    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  });

  useEffect(() => {
    if (!user) return;
    if (cloudLoading) return;
    if (!data) return;
    if (restoredTime === -1) return;
    (async () => {
      const hardcorePreference = await localforage.getItem(`hardcore-preference${type === "crossword" ? "-daily" : ""}`);
      if (hardcorePreference) {
        if (restoredTime > 0) {
          setOptions((prev) => prev.filter((x) => x !== "hardcore"));
          return;
        }
        setOptions((prev) => [...prev, "hardcore"]);
      }
    })();
  }, [cloudLoading, data, restoredTime]);

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
                onClick={async () => {
                  if (options.includes("hardcore")) {
                    if (
                      !(await dialog.confirm(
                        "Once you start in hardcore mode, you won't be able to pause the game or use autocheck. If you leave or close the tab, hardcore mode will be permanently invalidated for this puzzle, but you can still solve it normally.",
                        { title: "Ready to start?" }
                      ))
                    ) {
                      return;
                    }
                  }
                  setModalState(null);
                  posthog.capture(restoredTime > 0 ? "continue_puzzle" : "start_puzzle", { puzzle: data.id });
                }}
                onTouchStart={() => {
                  startTouched.current = true;
                  console.log("touch input detected");
                }}
                appearance="primary"
                startIcon={options.includes("hardcore") ? <StarIcon /> : undefined}
                loading={cloudLoading}
                disabled={cloudLoading}
              >
                {restoredTime > 0 ? "Continue Solving" : `Start Solving${options.includes("hardcore") ? " (Hardcore)" : ""}`}
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
            {user && (
              <Center width={"100%"}>
                <CheckboxGroup
                  value={options}
                  onChange={(value) => {
                    localforage.setItem(`hardcore-preference${type === "crossword" ? "-daily" : ""}`, value.includes("hardcore"));
                    setOptions(value);
                  }}
                >
                  <Checkbox value="hardcore" disabled={restoredTime > 0}>
                    Hardcore Mode{" "}
                    <Whisper
                      placement="top"
                      trigger={"hover"}
                      speaker={
                        <Tooltip>
                          When enabled, the game can't be paused and autocheck will be disabled. Exiting the tab will invalidate hardcore
                          mode. Can only be attempted once per puzzle.
                        </Tooltip>
                      }
                    >
                      <InfoIcon />
                    </Whisper>
                  </Checkbox>
                </CheckboxGroup>
              </Center>
            )}
            <ButtonGroup justified>
              <Button
                startIcon={<ArrowLeftIcon />}
                appearance="subtle"
                onClick={() => {
                  navigate("/");
                }}
              >
                Back
              </Button>
              {user ? (
                <Button startIcon={<ChartNoAxesColumnIcon />} appearance="subtle" onClick={() => setModalState("stats")}>
                  Stats
                </Button>
              ) : (
                <AccountButtons setModalState={setModalState} appearance="subtle" />
              )}
            </ButtonGroup>
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

      <Stats
        open={modalState === "stats"}
        setOpen={() => {
          setModalState("welcome");
        }}
        type={type}
      />

      {data && restoredTime > -1 && modalState === null ? (
        <Timer
          onPause={() => {
            pause();
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
