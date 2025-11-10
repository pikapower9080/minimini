import { useContext, useEffect, useMemo, useRef, useState } from "react";
import type { MiniCrossword, MiniCrosswordClue } from "../lib/types";
import { fireworks } from "../lib/confetti";
import { Modal } from "react-responsive-modal";
import Keyboard from "react-simple-keyboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faDoorOpen, faRightToBracket, faRotateLeft, faUser } from "@fortawesome/free-solid-svg-icons";
import posthog from "posthog-js";
import localforage from "localforage";
import SignIn from "./SignIn";
import { GlobalState } from "../lib/GlobalState";
import { Menu, MenuItem } from "@szhsin/react-menu";
import { pb } from "../main";
import throttle from "throttleit";
import { generateStateDocId } from "../lib/storage";
import { Button, Toggle } from "rsuite";
import Rating from "./Rating";
import formatDate from "../lib/formatDate";

interface MiniProps {
  data: MiniCrossword;
  startTouched: boolean;
  timeRef: React.RefObject<number[]>;
  complete: boolean;
  setComplete: (paused: boolean) => void;
}

const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890=+-?.,/".split("");

export default function Mini({ data, startTouched, timeRef, complete, setComplete }: MiniProps) {
  const body = data.body[0];

  const [selected, setSelected] = useState<number | null>(null);
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [boardState, setBoardState] = useState<{ [key: number]: string }>({});
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<"victory" | "incorrect">("victory");
  const [keyboardLayout, setKeyboardLayout] = useState<"default" | "numeric">("default");
  const [keyboardOpen, setKeyboardOpen] = useState<boolean>(startTouched);
  const [autoCheck, setAutoCheck] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const incorrectShown = useRef<boolean>(false);

  const { user, paused } = useContext(GlobalState);

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

  useEffect(() => {
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
  });

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
    if (modalOpen || signInOpen || paused) return;

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
    handleKeyDown(e, false);
  };

  useEffect(() => {
    document.addEventListener("keydown", handlePhysicalKeydown);
    document.addEventListener("touchstart", handleTouchStart);
    return () => {
      document.removeEventListener("keydown", handlePhysicalKeydown);
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, [selected, direction, boardState, complete, modalOpen, autoCheck, signInOpen, paused]);

  useEffect(() => {
    const results = checkBoard();
    if (results.totalCells > 0 && results.totalCells === results.totalCorrect) {
      setModalType("victory");
      setModalOpen(true);
      fireworks();
      incorrectShown.current = false;
      posthog.capture("completed_puzzle", { puzzle: data.id, puzzleDate: data.publicationDate, time: timeRef.current, autoCheck });
      setComplete(true);
      localforage.setItem(`complete-${data.id}`, true).then(() => {
        cloudSave(); // Force a cloud save upon completion
      });
    } else if (results.totalCells > 0 && results.totalCells === results.totalFilled && results.totalCorrect < results.totalCells) {
      if (incorrectShown.current) return;
      setModalType("incorrect");
      setModalOpen(true);
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
    const batch = pb.createBatch();
    const puzzleState = batch.collection("puzzle_state");
    const record = new FormData();
    Promise.all([
      localforage.getItem(`state-${data.id}`),
      localforage.getItem(`time-${data.id}`),
      localforage.getItem(`autocheck-${data.id}`),
      localforage.getItem(`selected-${data.id}`),
      localforage.getItem(`complete-${data.id}`),
      localforage.getItem(`cheated-${data.id}`)
    ] as any[]).then((saved) => {
      record.set("id", generateStateDocId(user, data));
      record.set("user", user.id);
      record.set("puzzle_id", data.id.toString());
      record.set("board_state", JSON.stringify(saved[0]));
      record.set("selected", JSON.stringify(saved[3]));
      record.set("time", saved[1]?.toString() ?? "0");
      record.set("autocheck", saved[2]?.toString() ?? "false");
      record.set("complete", saved[4]?.toString() ?? "false");
      record.set("cheated", saved[5]?.toString() ?? "false");

      puzzleState.upsert(record);

      batch
        .send()
        .then(() => {
          posthog.capture("cloud_save", { puzzle: data.id, puzzleDate: data.publicationDate });
        })
        .catch((err) => {
          console.error(err);
          posthog.capture("cloud_save_error", { puzzle: data.id, puzzleDate: data.publicationDate, error: err.message });
        });
    });
  }

  const throttledCloudSave = useMemo(() => throttle(cloudSave, 4000), []);

  useEffect(() => {
    throttledCloudSave();
  }, [boardState, autoCheck, complete, selected, direction, user]);

  function clearLocalPuzzleData(id = data.id) {
    return Promise.all([
      localforage.removeItem(`state-${id}`),
      localforage.removeItem(`time-${id}`),
      localforage.removeItem(`selected-${id}`),
      localforage.removeItem(`autocheck-${id}`),
      localforage.removeItem(`complete-${id}`),
      localforage.removeItem(`cheated-${id}`)
    ]);
  }

  return (
    <>
      <div className={`mini-container${!(keyboardOpen && selected !== null) ? "" : " keyboard-open"}`}>
        <div className="board-container">
          <div ref={boardRef} className="board" dangerouslySetInnerHTML={{ __html: body.board }}></div>
          <div className="toggle-container">
            <Toggle
              checked={autoCheck}
              name="autoCheck"
              onChange={(e) => {
                setAutoCheck(e);
              }}
            />
            <label>Autocheck</label>
          </div>
        </div>
        <div className="clues">
          {body.clueLists.map((list, index) => {
            return (
              <div key={index}>
                <h4 className="clue-set">{list.name}</h4>
                <ol>
                  {list.clues.map((clueIndex) => {
                    const clue = body.clues[clueIndex];
                    if (!clue) return null;
                    return (
                      <li
                        key={clueIndex}
                        className={`clue ${activeClues.includes(clueIndex) ? "active-clue" : ""} ${activeClues[selectedClue] === clueIndex ? "selected-clue" : ""}`}
                        onClick={() => {
                          const targetCell = clue.cells[0];
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
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} center showCloseIcon={false}>
        <h2>{modalType == "victory" ? "Congratulations!" : "Not Quite..."}</h2>
        <h3 style={{ marginBottom: 0 }}>
          {modalType == "victory" && timeRef.current.length > 0
            ? `You solved the Mini Crossword in ${timeRef.current[0]}:${timeRef.current[1].toString().padStart(2, "0")}`
            : "One or more squares are filled incorrectly."}
        </h3>
        <h4 style={{ marginBottom: 0 }}>{formatDate(data.publicationDate)}</h4>
        {modalType == "victory" && <Rating id={data.id} />}
        <Button
          onClick={() => {
            setModalOpen(false);
          }}
          style={{ marginTop: 15 }}
          appearance="primary"
        >
          {modalType == "victory" ? "Admire Puzzle" : "Keep Trying"}
        </Button>
      </Modal>
      <SignIn open={signInOpen} setOpen={setSignInOpen} />
      <div className="keyboard-container">
        <div className="bottom-icons">
          <label className="secondary-text">{user ? user?.username || "Unknown User" : "Guest"}</label>
          <Menu transition align="end" menuButton={<FontAwesomeIcon icon={faUser} />}>
            {user ? (
              <MenuItem
                onClick={() => {
                  pb.authStore.clear();
                  localforage.clear().then(() => {
                    window.location.reload();
                  });
                }}
              >
                <FontAwesomeIcon icon={faDoorOpen}></FontAwesomeIcon>Sign out
              </MenuItem>
            ) : (
              <MenuItem
                onClick={() => {
                  setSignInOpen(true);
                }}
              >
                <FontAwesomeIcon icon={faRightToBracket}></FontAwesomeIcon>Sign in
              </MenuItem>
            )}
          </Menu>
          <FontAwesomeIcon
            icon={faRotateLeft}
            onClick={() => {
              clearLocalPuzzleData().then(() => {
                if (user) {
                  pb.collection("puzzle_state")
                    .delete(generateStateDocId(user, data))
                    .finally(() => {
                      posthog.capture("reset_puzzle", { puzzle: data.id, puzzleDate: data.publicationDate });
                      location.reload();
                    });
                } else {
                  posthog.capture("reset_puzzle", { puzzle: data.id, puzzleDate: data.publicationDate });
                  location.reload();
                }
              });
            }}
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
                <FontAwesomeIcon icon={faChevronLeft} />
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
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </div>
          </>
        ) : (
          ""
        )}
        <Keyboard
          onKeyPress={(key) => {
            if (key === "{numbers}" || key === "{abc}") {
              setKeyboardLayout(key === "{numbers}" ? "numeric" : "default");
              return;
            }
            let keyCode = key;
            if (key === "{bksp}") keyCode = "Backspace";
            if (key === "{enter}") keyCode = "Enter";
            if (key === "{esc}") keyCode = "Escape";
            if (key === "{tab}") keyCode = "Tab";
            handleKeyDown(new KeyboardEvent("keydown", { key: keyCode }), true);
          }}
          layout={{
            default: ["Q W E R T Y U I O P", "A S D F G H J K L", "{numbers} Z X C V B N M {bksp}"],
            numeric: ["1 2 3", "4 5 6", "7 8 9", "{abc} 0 {bksp}"]
          }}
          display={{
            "{numbers}": "123",
            "{abc}": "ABC",
            "{bksp}": "⌫"
          }}
          layoutName={keyboardLayout}
          autoUseTouchEvents={true}
          theme={!(keyboardOpen && selected !== null) ? "hidden" : ""}
        />
      </div>
    </>
  );
}
