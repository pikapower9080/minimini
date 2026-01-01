import { lazy, Suspense, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Modal } from "rsuite";
import posthog from "posthog-js";
import localforage from "localforage";
import throttle from "throttleit";
import { Button, ButtonGroup, HStack, VStack, Toggle, Heading } from "rsuite";
import { ChevronLeftIcon, ChevronRightIcon, TrophyIcon } from "lucide-react";

import type { MiniCrossword, MiniCrosswordClue } from "@/lib/types";
import { pb } from "@/main";
import { fireworks } from "@/lib/confetti";
import { GlobalState } from "@/lib/GlobalState";
import formatDate from "@/lib/formatDate";
import Leaderboard from "@/Components/Leaderboard";
import Rating from "@/Components/Rating";
import { MiniState } from "@/routes/mini/state";
import PuzzleMenu from "./PuzzleMenu";

const Keyboard = lazy(async () => ({
  default: (await import("@/Components/VirtualKeyboard")).default
}));

interface MiniProps {
  data: MiniCrossword;
  startTouched: boolean;
  timeRef: React.RefObject<number[]>;
  complete: boolean;
  setComplete: (paused: boolean) => void;
  stateDocId: RefObject<string>;
}

const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890=+-?.,/".split("");

export default function Mini({ data, startTouched, timeRef, complete, setComplete, stateDocId }: MiniProps) {
  const body = data.body[0];

  const [selected, setSelected] = useState<number | null>(null);
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [boardState, setBoardState] = useState<{ [key: number]: string }>({});
  const [modalType, setModalType] = useState<"victory" | "incorrect" | "leaderboard" | null>(null);
  const [keyboardOpen, setKeyboardOpen] = useState<boolean>(startTouched);
  const [autoCheck, setAutoCheck] = useState(false);
  const [boardHeight, setBoardHeight] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const incorrectShown = useRef<boolean>(false);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const { user } = useContext(GlobalState);
  const { paused, type } = useContext(MiniState);

  useLayoutEffect(() => {
    if (boardRef.current) {
      setBoardHeight(boardRef.current.offsetHeight);
    }
  }, [body.board]);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (boardRef.current) {
        setBoardHeight(boardRef.current.offsetHeight);
      }
    });
    // @ts-ignore
    ro.observe(boardRef.current);
    return () => ro.disconnect();
  }, []);

  function typeLetter(letter: string, cellIndex: number) {
    if (!boardRef.current) return;
    if (complete) return;
    const square = boardRef.current.querySelector(`g[data-index='${cellIndex}']`);
    if (!square) return;
    const guess = square.querySelector(".guess");
    if (!guess) return;
    if (
      autoCheck &&
      "answer" in body.cells[cellIndex] &&
      boardState[cellIndex] &&
      boardState[cellIndex]?.toUpperCase() === body.cells[cellIndex].answer?.toUpperCase()
    ) {
      return;
    }
    setBoardState((prev) => {
      const newState = { ...prev };
      if (letter === "") {
        delete newState[cellIndex];
      } else {
        newState[cellIndex] = letter;
      }
      localforage.setItem(`state-${data.id}`, newState);
      return newState;
    });
  }

  function getCellsInDirection(start: number, dir: "across" | "down") {
    if (!body.cells[start].clues) return [];
    const cells: number[] = [];
    body.cells[start].clues.forEach((clueIndex) => {
      const clue = body.clues[clueIndex];
      if (clue.direction.toLowerCase() === dir) {
        cells.push(...clue.cells);
      }
    });
    return cells;
  }

  function checkBoard() {
    let totalCells = 0;
    let totalFilled = 0;
    let totalCorrect = 0;
    body.cells.forEach((cell, index) => {
      if (cell.answer) {
        totalCells++;
        if (boardState[index]) {
          totalFilled++;
        }
        if (boardState[index]?.toUpperCase() === cell.answer.toUpperCase()) {
          totalCorrect++;
        }
      }
    });
    return { totalCells, totalFilled, totalCorrect };
  }

  useLayoutEffect(() => {
    if (!boardRef.current) return;
    const cells = boardRef.current.querySelectorAll(".cell");
    cells.forEach((cell) => {
      // Cell renderer
      const parent = cell.parentElement;
      if (!parent) return;
      const index = parseInt(parent.getAttribute("data-index") || "-1", 10);
      if (isNaN(index) || index < 0) return;

      let highlightedCells: number[] = [];
      if (selected !== null) {
        highlightedCells = getCellsInDirection(selected, direction);
      }

      if (highlightedCells.includes(index)) {
        cell.classList.add("highlighted");
      }

      if (cell.getAttribute("fill") === "none") {
        if (selected === index) {
          cell.classList.add("selected");
        } else {
          cell.setAttribute("fill", "transparent");
        }
      }

      if (boardState[index]) {
        const guess = parent.querySelector(".guess");
        if (guess) {
          (guess as HTMLElement).innerHTML = boardState[index].toUpperCase();
        }
      }

      if ("answer" in body.cells[index]) {
        parent.addEventListener("click", () => {
          if (selected === index) {
            setDirection(direction === "across" ? "down" : "across");
          }
          setSelected(index);
        });
        if (autoCheck) {
          const guess = parent.querySelector(".guess");
          if (guess && boardState[index]?.toUpperCase() === body.cells[index].answer?.toUpperCase() && boardState[index] !== undefined) {
            guess.classList.add("correct");
          } else {
            guess?.classList.add("incorrect");
          }
        }
      }
    });

    if (data.assets && data.assets.length > 0) {
      let startOverlay = null;
      let solveOverlay = null;
      data.assets.forEach((asset) => {
        if (asset.uri.endsWith(".start.png")) {
          startOverlay = asset.uri;
        }
        if (asset.uri.endsWith(".solve.png")) {
          solveOverlay = asset.uri;
        }
      });
      if ((startOverlay && solveOverlay && !complete) || (startOverlay && !solveOverlay)) {
        const overlay = document.createElement("image");
        boardRef.current.querySelector("svg")?.appendChild(overlay);
        overlay.outerHTML = `<image href="${startOverlay}" width="100%" height="100%" class="overlay"></image>`;
      }
      if (solveOverlay && complete) {
        const overlay = document.createElement("image");
        boardRef.current.querySelector("svg")?.appendChild(overlay);
        overlay.outerHTML = `<image href="${solveOverlay}" width="100%" height="100%" class="overlay"></image>`;
      }
    }
  });

  useEffect(() => {
    const selectedClue = document.querySelector(".selected-clue");
    if (selectedClue) {
      selectedClue.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selected, direction]);

  useEffect(() => {
    if (autoCheck) {
      localforage.setItem(`cheated-${data.id}`, true);
      posthog.capture("enabled_autocheck", { puzzle: data.id, puzzleDate: data.publicationDate, time: timeRef.current });
    } else {
      posthog.capture("disabled_autocheck", { puzzle: data.id, puzzleDate: data.publicationDate, time: timeRef.current });
    }
    localforage.setItem(`autocheck-${data.id}`, autoCheck);
  }, [autoCheck]);

  function getFirstEmptyCell(clue: MiniCrosswordClue) {
    for (let i = 0; i < clue.cells.length; i++) {
      const cellIndex = clue.cells[i];
      if (!boardState[cellIndex]) {
        return cellIndex;
      }
    }
    return clue.cells[0];
  }

  function next() {
    if (selected === null) return;
    const currentClue = body.clues.findIndex((clue) => clue.cells.includes(selected) && clue.direction.toLowerCase() === direction);
    const nextClue = body.clues[(currentClue + 1) % body.clues.length];
    if (nextClue) {
      setSelected(getFirstEmptyCell(nextClue));
      setDirection(nextClue.direction.toLowerCase() === "across" ? "across" : "down");
    }
  }
  function previous(start: boolean = false) {
    if (selected === null) return;
    const currentClue = body.clues.findIndex((clue) => clue.cells.includes(selected) && clue.direction.toLowerCase() === direction);
    const prevClue = body.clues[(currentClue - 1 + body.clues.length) % body.clues.length];
    if (prevClue) {
      if (start) {
        setSelected(getFirstEmptyCell(prevClue));
      } else {
        setSelected(prevClue.cells[prevClue.cells.length - 1]);
      }
      setDirection(prevClue.direction.toLowerCase() === "across" ? "across" : "down");
    }
  }

  const handleKeyDown = (e: KeyboardEvent, virtual: boolean) => {
    if (!virtual) {
      // close the virtual keyboard when a physical key is pressed
      setKeyboardOpen(false);
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (modalType !== null || paused) return;

    // Typing logic
    if (letters.includes(e.key) && selected !== null) {
      typeLetter(e.key, selected);
      const highlightedCells = getCellsInDirection(selected, direction);
      const localIndex = highlightedCells.indexOf(selected);
      if (localIndex >= 0 && localIndex < highlightedCells.length - 1) {
        setSelected(highlightedCells[localIndex + 1]);
      } else if (localIndex === highlightedCells.length - 1) {
        // jump to the next clue if at the end of the current one
        next();
      }
    }

    if (e.key === "Backspace" && selected !== null) {
      // Delete logic
      const highlightedCells = getCellsInDirection(selected, direction);
      const localIndex = highlightedCells.indexOf(selected);
      if (localIndex > 0) {
        // clear the cell and jump back
        typeLetter("", selected);
        const lastSelected = selected;
        setSelected(highlightedCells[localIndex - 1]);
        if (!boardState[lastSelected]) {
          // jump back and clear previous only if current cell was already empty
          typeLetter("", highlightedCells[localIndex - 1]);
        }
      } else if (localIndex === 0) {
        // first cell of the clue
        const empty = boardState[highlightedCells[localIndex]] === undefined;
        if (autoCheck) {
          const correct =
            boardState[highlightedCells[localIndex]]?.toUpperCase() === body.cells[highlightedCells[localIndex]].answer?.toUpperCase();
          if (correct || empty) {
            previous();
          } else {
            typeLetter("", highlightedCells[localIndex]);
          }
        } else {
          if (empty || complete) {
            previous();
          } else {
            // clear box without moving
            typeLetter("", highlightedCells[localIndex]);
          }
        }
      }
    }

    function arrowKey(key: string, dir: "across" | "down") {
      if (selected === null) return;
      if (direction !== dir) {
        setDirection(dir);
        return;
      }

      const highlightedCells = getCellsInDirection(selected, dir);
      const localIndex = highlightedCells.indexOf(selected);

      if (key === "ArrowRight" || key === "ArrowDown") {
        if (localIndex >= 0 && localIndex < highlightedCells.length - 1) {
          setSelected(highlightedCells[localIndex + 1]);
        }
      } else if (key === "ArrowLeft" || key === "ArrowUp") {
        if (localIndex > 0) {
          setSelected(highlightedCells[localIndex - 1]);
        }
      }
    }

    if (e.key === "ArrowRight") {
      arrowKey("ArrowRight", "across");
    }
    if (e.key === "ArrowLeft") {
      arrowKey("ArrowLeft", "across");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      arrowKey("ArrowDown", "down");
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      arrowKey("ArrowUp", "down");
    }

    if (e.key === "Enter" && selected !== null) {
      next();
    }
    if (e.key === "Tab" && selected !== null) {
      e.preventDefault();
      if (e.shiftKey) {
        previous(true);
      } else {
        next();
      }
    }
  };

  const handleTouchStart = () => {
    setKeyboardOpen(true);
  };

  const handlePhysicalKeydown = (e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
      e.preventDefault();
    }
    handleKeyDown(e, false);
  };

  useEffect(() => {
    document.addEventListener("keydown", handlePhysicalKeydown);
    document.addEventListener("touchstart", handleTouchStart);
    return () => {
      document.removeEventListener("keydown", handlePhysicalKeydown);
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, [selected, direction, boardState, complete, modalType, autoCheck, paused]);

  useEffect(() => {
    const results = checkBoard();
    if (results.totalCells > 0 && results.totalCells === results.totalCorrect) {
      setModalType("victory");
      if (!prefersReducedMotion) {
        fireworks();
      }
      incorrectShown.current = false;
      posthog.capture("completed_puzzle", { puzzle: data.id, puzzleDate: data.publicationDate, time: timeRef.current, autoCheck });
      setComplete(true);
      localforage.setItem(`complete-${data.id}`, true).then(() => {
        cloudSave(); // Force a cloud save upon completion
        submitScore();
      });
    } else if (results.totalCells > 0 && results.totalCells === results.totalFilled && results.totalCorrect < results.totalCells) {
      if (incorrectShown.current) return;
      setModalType("incorrect");
      incorrectShown.current = true;
      posthog.capture("incorrect_solution", { puzzle: data.id, puddleDate: data.publicationDate, time: timeRef.current, autoCheck });
    }
  }, [boardState]);

  useEffect(() => {
    Promise.all([
      localforage.getItem(`state-${data.id}`),
      localforage.getItem(`autocheck-${data.id}`),
      localforage.getItem(`selected-${data.id}`)
    ]).then(([savedState, savedAutoCheck, savedSelected]) => {
      let selectionRestored = false;
      if (savedState && typeof savedState === "object") {
        setBoardState(savedState as { [key: number]: string });
      }
      if (savedAutoCheck !== null && typeof savedAutoCheck === "boolean") {
        setAutoCheck(savedAutoCheck);
      }
      if (savedSelected && Array.isArray(savedSelected) && savedSelected.length === 2) {
        const [sel, dir] = savedSelected;
        if (typeof sel === "number" && (dir === "across" || dir === "down")) {
          setSelected(sel);
          setDirection(dir);
          selectionRestored = true;
        }
      }
      if (selected === null && !selectionRestored) {
        const firstCell = body.cells.findIndex((cell) => "answer" in cell);
        if (firstCell >= 0) {
          setSelected(firstCell);
        }
      }
    });
  }, []);

  useEffect(() => {
    localforage.setItem(`selected-${data.id}`, [selected, direction]);
  }, [selected, direction, data.id]);

  let activeClues: number[] = [];
  let selectedClue = -1;
  let globalSelectedClue: MiniCrosswordClue | null = null;

  if (selected !== null) {
    activeClues = body.cells[selected].clues || [];
    selectedClue = activeClues.findIndex((clueIndex) => body.clues[clueIndex].direction.toLowerCase() === direction);
    globalSelectedClue =
      body.clues[activeClues.find((clueIndex) => body.clues[clueIndex].direction.toLowerCase() === direction) || 0] || {};
  }

  async function cloudSave() {
    if (!user) return;
    const puzzleState = pb.collection("puzzle_state");
    const record = new FormData();
    Promise.all([
      localforage.getItem(`state-${data.id}`),
      localforage.getItem(`time-${data.id}`),
      localforage.getItem(`autocheck-${data.id}`),
      localforage.getItem(`selected-${data.id}`),
      localforage.getItem(`complete-${data.id}`),
      localforage.getItem(`cheated-${data.id}`)
    ] as any[]).then((saved) => {
      record.set("user", user.id);
      record.set("puzzle_id", data.id.toString());
      record.set("board_state", JSON.stringify(saved[0]));
      record.set("selected", JSON.stringify(saved[3]));
      record.set("time", saved[1]?.toString() ?? "0");
      record.set("autocheck", saved[2]?.toString() ?? "false");
      record.set("complete", saved[4]?.toString() ?? "false");
      record.set("cheated", saved[5]?.toString() ?? "false");

      function onSaveError(err: any) {
        console.error(err);
        posthog.capture("cloud_save_error", { puzzle: data.id, puzzleDate: data.publicationDate, error: err.message });
      }

      if (stateDocId.current) {
        puzzleState
          .update(stateDocId.current, record)
          .then(() => {
            posthog.capture("cloud_save_update", { puzzle: data.id, puzzleDate: data.publicationDate, stateDocId: stateDocId.current });
          })
          .catch(onSaveError);
      } else {
        puzzleState
          .create(record)
          .then((createdRecord) => {
            stateDocId.current = createdRecord.id;
            posthog.capture("cloud_save_create", { puzzle: data.id, puzzleDate: data.publicationDate, stateDocId: stateDocId.current });
          })
          .catch(onSaveError);
      }
    });
  }

  async function submitScore() {
    if (!user) return;
    const leaderboard = pb.collection("leaderboard");
    const record = new FormData();
    Promise.all([
      localforage.getItem(`time-${data.id}`),
      localforage.getItem(`complete-${data.id}`),
      localforage.getItem(`cheated-${data.id}`)
    ] as any[]).then((saved) => {
      if (!saved[1]) return; // only submit if complete
      record.set("user", user.id);
      record.set("puzzle_id", data.id.toString());
      record.set("time", saved[0]?.toString() ?? "0");
      record.set("cheated", saved[2]?.toString() ?? "false");
      record.set("platform", keyboardOpen ? "mobile" : "desktop");
      record.set("type", type);

      leaderboard
        .create(record)
        .catch((err) => {
          console.warn("Leaderboard submit error, this may be intentional:", err);
        })
        .then(() => {
          posthog.capture("leaderboard_submission", { puzzle: data.id, puzzleDate: data.publicationDate, time: timeRef.current });
        });
    });
  }

  const throttledCloudSave = useMemo(() => throttle(cloudSave, 4000), []);

  useEffect(() => {
    throttledCloudSave();
  }, [boardState, autoCheck, complete, selected, direction, user]);

  async function clearLocalPuzzleData(id = data.id): Promise<void> {
    await Promise.all([
      localforage.removeItem(`state-${id}`),
      localforage.removeItem(`time-${id}`),
      localforage.removeItem(`selected-${id}`),
      localforage.removeItem(`autocheck-${id}`),
      localforage.removeItem(`complete-${id}`),
      localforage.removeItem(`cheated-${id}`)
    ]);
    return;
  }

  return (
    <>
      <HStack
        alignItems={"stretch"}
        spacing={0}
        className={`mini-container${!(keyboardOpen && selected !== null) ? "" : " keyboard-open"}`}
      >
        <VStack className="board-container">
          <div ref={boardRef} className={`board board-${type}`} dangerouslySetInnerHTML={{ __html: body.board }}></div>
          <HStack justifyContent={"center"} className="toggle-container">
            <Toggle
              checked={autoCheck}
              name="autoCheck"
              onChange={(e) => {
                setAutoCheck(e);
              }}
            />
            <label>Autocheck</label>
          </HStack>
        </VStack>

        <div className="clues" style={{ maxHeight: boardHeight - 5 }}>
          {body.clueLists.map((list, index) => {
            return (
              <div key={index}>
                <Heading level={4} style={{ textAlign: "left" }} className="clue-set">
                  {list.name}
                </Heading>
                <ol>
                  {list.clues.map((clueIndex) => {
                    const clue = body.clues[clueIndex];
                    if (!clue) return null;
                    return (
                      <li
                        key={clueIndex}
                        className={`clue ${activeClues.includes(clueIndex) ? "active-clue" : ""} ${activeClues[selectedClue] === clueIndex ? "selected-clue" : ""}`}
                        onClick={() => {
                          const targetCell = getFirstEmptyCell(clue);
                          setSelected(targetCell);
                          setDirection(clue.direction.toLowerCase() === "across" ? "across" : "down");
                        }}
                      >
                        <span className="clue-label">{clue.label}</span>{" "}
                        <span className="clue-text">{clue.text.map((t) => t.plain).join(" ")}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
          })}
        </div>
      </HStack>

      <Modal open={modalType === "victory"} onClose={() => setModalType(null)} centered size="fit-content" overflow={false}>
        <VStack spacing={15}>
          <VStack spacing={5}>
            <Heading level={2}>Congratulations!</Heading>
            {timeRef.current.length === 2 && (
              <Heading level={3}>
                You solved {type === "mini" && "the Mini Crossword"}
                {type === "crossword" && "the Daily Crossword"} in {timeRef.current[0]}:{timeRef.current[1].toString().padStart(2, "0")}
              </Heading>
            )}
            <Heading level={4}>{formatDate(data.publicationDate)}</Heading>
          </VStack>
          <Rating id={data.id} />
          <ButtonGroup vertical block>
            <Button
              onClick={() => {
                setModalType(null);
              }}
              appearance="primary"
            >
              Admire Puzzle
            </Button>
            {pb.authStore.isValid && (
              <Button
                onClick={() => {
                  setModalType("leaderboard");
                }}
                startIcon={<TrophyIcon />}
              >
                Leaderboard
              </Button>
            )}
          </ButtonGroup>
        </VStack>
      </Modal>

      <Leaderboard
        open={modalType === "leaderboard"}
        setOpen={() => {
          setModalType("victory");
        }}
        puzzleData={data}
      />

      <Modal open={modalType === "incorrect"} onClose={() => setModalType(null)} centered size="fit-content" overflow={false}>
        <VStack spacing={10}>
          <Heading level={2}>Not Quite...</Heading>
          <Heading level={3}>One or more squares are filled incorrectly.</Heading>
          <Button
            onClick={() => {
              setModalType(null);
            }}
            appearance="primary"
            className="auto-center"
          >
            Keep Trying
          </Button>
        </VStack>
      </Modal>

      <div className="keyboard-container">
        <div className="bottom-icons">
          <PuzzleMenu
            data={data}
            clearLocalPuzzleData={clearLocalPuzzleData}
            stateDocId={stateDocId}
            setPuzzleModalState={setModalType}
            complete={complete}
          />
        </div>
        {keyboardOpen && selected !== null && selectedClue > -1 ? (
          <>
            <div className="clue-bar">
              <div
                className="clue-bar-back"
                onClick={() => {
                  previous(true);
                }}
              >
                <ChevronLeftIcon />
              </div>
              {globalSelectedClue !== null ? (
                <span className="clue-bar-text">{globalSelectedClue.text.map((t) => t.plain).join(" ")}</span>
              ) : (
                ""
              )}
              <div
                className="clue-bar-forward"
                onClick={() => {
                  next();
                }}
              >
                <ChevronRightIcon />
              </div>
            </div>

            <Suspense fallback={null}>
              <Keyboard handleKeyDown={handleKeyDown} />
            </Suspense>
          </>
        ) : (
          ""
        )}
      </div>
    </>
  );
}
