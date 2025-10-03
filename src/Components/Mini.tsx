import { useEffect, useRef, useState } from "react";
import type { MiniCrossword, MiniCrosswordClue } from "../lib/types";
import { fireworks } from "../lib/confetti";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import posthog from "posthog-js";
import { ToggleSlider } from "react-toggle-slider";

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
  const [autoCheck, setAutoCheck] = useState<boolean>(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const incorrectShown = useRef<boolean>(false);

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
      posthog.capture("enabled_autocheck", { puzzle: data.id, puzzleDate: data.publicationDate, time: timeRef.current });
    } else {
      posthog.capture("disabled_autocheck", { puzzle: data.id, puzzleDate: data.publicationDate, time: timeRef.current });
    }
  }, [autoCheck]);

  function next() {
    if (selected === null) return;
    const currentClue = body.clues.findIndex((clue) => clue.cells.includes(selected) && clue.direction.toLowerCase() === direction);
    const nextClue = body.clues[(currentClue + 1) % body.clues.length];
    if (nextClue) {
      setSelected(nextClue.cells[0]);
      setDirection(nextClue.direction.toLowerCase() === "across" ? "across" : "down");
    }
  }
  function previous() {
    if (selected === null) return;
    const currentClue = body.clues.findIndex((clue) => clue.cells.includes(selected) && clue.direction.toLowerCase() === direction);
    const prevClue = body.clues[(currentClue - 1 + body.clues.length) % body.clues.length];
    if (prevClue) {
      setSelected(prevClue.cells[prevClue.cells.length - 1]);
      setDirection(prevClue.direction.toLowerCase() === "across" ? "across" : "down");
      typeLetter("", prevClue.cells[prevClue.cells.length - 1]);
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (modalOpen) return;
    if (e.key === "Escape") {
      setSelected(null);
    }
    if (letters.includes(e.key) && selected !== null) {
      typeLetter(e.key, selected);
      const highlightedCells = getCellsInDirection(selected, direction);
      const localIndex = highlightedCells.indexOf(selected);
      if (localIndex >= 0 && localIndex < highlightedCells.length - 1) {
        setSelected(highlightedCells[localIndex + 1]);
      } else if (localIndex === highlightedCells.length - 1) {
        next();
      }
    }
    if (e.key === "Backspace" && selected !== null) {
      const highlightedCells = getCellsInDirection(selected, direction);
      const localIndex = highlightedCells.indexOf(selected);
      if (localIndex > 0) {
        typeLetter("", selected);
        const lastSelected = selected;
        setSelected(highlightedCells[localIndex - 1]);
        if (!boardState[lastSelected]) {
          typeLetter("", highlightedCells[localIndex - 1]);
        }
      } else if (localIndex === 0) {
        typeLetter("", highlightedCells[localIndex]);
        previous();
      }
    }
    if (e.key === "ArrowRight" && selected !== null) {
      if (direction !== "across") {
        setDirection("across");
      } else {
        const highlightedCells = getCellsInDirection(selected, "across");
        const localIndex = highlightedCells.indexOf(selected);
        if (localIndex >= 0 && localIndex < highlightedCells.length - 1) {
          setSelected(highlightedCells[localIndex + 1]);
        }
      }
    }
    if (e.key === "ArrowLeft" && selected !== null) {
      if (direction !== "across") {
        setDirection("across");
      } else {
        const highlightedCells = getCellsInDirection(selected, "across");
        const localIndex = highlightedCells.indexOf(selected);
        if (localIndex > 0) {
          setSelected(highlightedCells[localIndex - 1]);
        }
      }
    }
    if (e.key === "ArrowDown" && selected !== null) {
      e.preventDefault();
      if (direction !== "down") {
        setDirection("down");
      } else {
        const highlightedCells = getCellsInDirection(selected, "down");
        const localIndex = highlightedCells.indexOf(selected);
        if (localIndex >= 0 && localIndex < highlightedCells.length - 1) {
          setSelected(highlightedCells[localIndex + 1]);
        }
      }
    }
    if (e.key === "ArrowUp" && selected !== null) {
      e.preventDefault();
      if (direction !== "down") {
        setDirection("down");
      } else {
        const highlightedCells = getCellsInDirection(selected, "down");
        const localIndex = highlightedCells.indexOf(selected);
        if (localIndex > 0) {
          setSelected(highlightedCells[localIndex - 1]);
        }
      }
    }
    if (e.key === "Enter" && selected !== null) {
      next();
    }
    if (e.key === "Tab" && selected !== null) {
      e.preventDefault();
      if (e.shiftKey) {
        previous();
      } else {
        next();
      }
    }
  };

  const handleTouchStart = () => {
    setKeyboardOpen(true);
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("touchstart", handleTouchStart);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, [selected, direction, boardState, complete, modalOpen, autoCheck]);

  useEffect(() => {
    const results = checkBoard();
    if (results.totalCells > 0 && results.totalCells === results.totalCorrect) {
      setModalType("victory");
      setModalOpen(true);
      fireworks();
      incorrectShown.current = false;
      posthog.capture("completed_puzzle", { puzzle: data.id, puzzleDate: data.publicationDate, time: timeRef.current, autoCheck });
      setComplete(true);
    } else if (results.totalCells > 0 && results.totalCells === results.totalFilled && results.totalCorrect < results.totalCells) {
      if (incorrectShown.current) return;
      setModalType("incorrect");
      setModalOpen(true);
      incorrectShown.current = true;
      posthog.capture("incorrect_solution", { puzzle: data.id, puddleDate: data.publicationDate, time: timeRef.current, autoCheck });
    }
  }, [boardState]);

  useEffect(() => {
    if (selected === null) {
      const firstCell = body.cells.findIndex((cell) => "answer" in cell);
      if (firstCell >= 0) {
        setSelected(firstCell);
      }
    }
  }, []);

  let activeClues: number[] = [];
  let selectedClue = -1;
  let globalSelectedClue: MiniCrosswordClue | null = null;

  if (selected !== null) {
    activeClues = body.cells[selected].clues || [];
    selectedClue = activeClues.findIndex((clueIndex) => body.clues[clueIndex].direction.toLowerCase() === direction);
    globalSelectedClue =
      body.clues[activeClues.find((clueIndex) => body.clues[clueIndex].direction.toLowerCase() === direction) || 0] || {};
  }

  return (
    <>
      <div className={`mini-container${!(keyboardOpen && selected !== null) ? "" : " keyboard-open"}`}>
        <div className="board-container">
          <div ref={boardRef} className="board" dangerouslySetInnerHTML={{ __html: body.board }}></div>
          <div className="toggle-container">
            <ToggleSlider active={autoCheck} onToggle={setAutoCheck} />
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
        <h3>
          {modalType == "victory" && timeRef.current.length > 0
            ? `You solved the Mini Crossword in ${timeRef.current[0]}:${timeRef.current[1].toString().padStart(2, "0")}`
            : "One or more squares are filled incorrectly."}
        </h3>
        <button
          onClick={() => {
            setModalOpen(false);
          }}
        >
          {modalType == "victory" ? "Admire Puzzle" : "Keep Trying"}
        </button>
      </Modal>
      <div className="keyboard-container">
        {keyboardOpen && selected !== null && selectedClue > -1 ? (
          <>
            <div className="clue-bar">
              <div className="clue-bar-back" onClick={previous}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </div>
              {globalSelectedClue !== null ? (
                <span className="clue-bar-text">{globalSelectedClue.text.map((t) => t.plain).join(" ")}</span>
              ) : (
                ""
              )}
              <div className="clue-bar-forward" onClick={next}>
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
            handleKeyDown(new KeyboardEvent("keydown", { key: keyCode }));
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
