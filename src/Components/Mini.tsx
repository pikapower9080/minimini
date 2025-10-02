import { useEffect, useRef, useState } from 'react';
import type { MiniCrossword } from '../lib/types';
import { fireworks } from '../lib/confetti';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';

interface MiniProps {
	data: MiniCrossword;
}

const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890=+-?.,/".split('');

export default function Mini({ data }: MiniProps) {
	const body = data.body[0];

	const [selected, setSelected] = useState<number | null>(null);
	const [direction, setDirection] = useState<"across" | "down">("across");
	const [boardState, setBoardState] = useState<{[key: number]: string}>({});
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [modalType, setModalType] = useState<"victory" | "incorrect">("victory");
	const boardRef = useRef<HTMLDivElement>(null);

	function typeLetter(letter: string, cellIndex: number) {
		if (!boardRef.current) return;
		const square = boardRef.current.querySelector(`g[data-index='${cellIndex}']`);
		if (!square) return;
		const guess = square.querySelector(".guess");
		if (!guess) return;
		// (guess as HTMLElement).innerHTML = letter.toUpperCase();
		setBoardState((prev) => {
			const newState = {...prev};
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
		})
		return {totalCells, totalFilled, totalCorrect};
	}

	useEffect(() => {
		if (!boardRef.current) return;
		const cells = boardRef.current.querySelectorAll('.cell');
		cells.forEach((cell) => {
			const parent = cell.parentElement;
			if (!parent) return;
			const index = parseInt(parent.getAttribute('data-index') || '-1', 10);
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

			if ('answer' in body.cells[index]) {
				parent.addEventListener('click', () => {
					if (selected === index) {
						setDirection(direction === "across" ? "down" : "across");
					}
					setSelected(index);
				});
			}
		})
	});

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
			if (e.metaKey || e.ctrlKey || e.altKey) return;
			if (modalOpen) return;
            if (e.key === "Escape") {
                setSelected(null);
            }
			function next() {
				const currentClue = body.clues.findIndex(clue => clue.cells.includes(selected) && clue.direction.toLowerCase() === direction);
				const nextClue = body.clues[(currentClue + 1) % body.clues.length];
				if (nextClue) {
					setSelected(nextClue.cells[0]);
					setDirection(nextClue.direction.toLowerCase() === "across" ? "across" : "down");
				}
			}
			function previous() {
				const currentClue = body.clues.findIndex(clue => clue.cells.includes(selected) && clue.direction.toLowerCase() === direction);
				const prevClue = body.clues[(currentClue - 1 + body.clues.length) % body.clues.length];
				if (prevClue) {
					setSelected(prevClue.cells[prevClue.cells.length - 1]);
					setDirection(prevClue.direction.toLowerCase() === "across" ? "across" : "down");
					typeLetter("", prevClue.cells[prevClue.cells.length - 1]);
				}
			}
            if (letters.includes(e.key) && selected !== null) {
                typeLetter(e.key, selected);
				const highlightedCells = getCellsInDirection(selected, direction);
				const currentIndex = highlightedCells.indexOf(selected);
				if (currentIndex >= 0 && currentIndex < highlightedCells.length - 1) {
					setSelected(highlightedCells[currentIndex + 1]);
				} else if (currentIndex === highlightedCells.length - 1) {
					next()
				}
            }
			if (e.key === "Backspace" && selected !== null) {
				// If the cell is filled, clear it, if it is empty, select one before
				if (boardState[selected]) {
					typeLetter("", selected);
				} else {
					const highlightedCells = getCellsInDirection(selected, direction);
					const currentIndex = highlightedCells.indexOf(selected);
					if (currentIndex > 0) {
						setSelected(highlightedCells[currentIndex - 1]);
						typeLetter("", highlightedCells[currentIndex - 1]);
					} else if (currentIndex === 0) {
						previous();
					}
				}
			}
			if (e.key === "ArrowRight" && selected !== null) {
				if (direction !== "across") {
					setDirection("across");
				} else {
					const highlightedCells = getCellsInDirection(selected, "across");
					const currentIndex = highlightedCells.indexOf(selected);
					if (currentIndex >= 0 && currentIndex < highlightedCells.length - 1) {
						setSelected(highlightedCells[currentIndex + 1]);
					}
				}
			}
			if (e.key === "ArrowLeft" && selected !== null) {
				if (direction !== "across") {
					setDirection("across");
				} else {
					const highlightedCells = getCellsInDirection(selected, "across");
					const currentIndex = highlightedCells.indexOf(selected);
					if (currentIndex > 0) {
						setSelected(highlightedCells[currentIndex - 1]);
					}
				}
			}
			if (e.key === "ArrowDown" && selected !== null) {
				e.preventDefault();
				if (direction !== "down") {
					setDirection("down");
				} else {
					const highlightedCells = getCellsInDirection(selected, "down");
					const currentIndex = highlightedCells.indexOf(selected);
					if (currentIndex >= 0 && currentIndex < highlightedCells.length - 1) {
						setSelected(highlightedCells[currentIndex + 1]);
					}
				}
			}
			if (e.key === "ArrowUp" && selected !== null) {
				e.preventDefault();
				if (direction !== "down") {
					setDirection("down");
				} else {
					const highlightedCells = getCellsInDirection(selected, "down");
					const currentIndex = highlightedCells.indexOf(selected);
					if (currentIndex > 0) {
						setSelected(highlightedCells[currentIndex - 1]);
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

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
	}, [selected, direction, boardState]);

	useEffect(() => {
		const results = checkBoard();
		if (results.totalCells > 0 && results.totalCells === results.totalCorrect) {
			setModalType("victory");
			setModalOpen(true);
			fireworks();
		} else if (results.totalCells > 0 && results.totalCells === results.totalFilled && results.totalCorrect < results.totalCells) {
			setModalType("incorrect");
			setModalOpen(true);
		}
	}, [boardState]);

	let activeClues: number[] = [];
	let selectedClue = -1;

	if (selected !== null) {
		activeClues = body.cells[selected].clues || [];
		selectedClue = activeClues.findIndex(clueIndex => body.clues[clueIndex].direction.toLowerCase() === direction);
	}

	return (
		<>
			<div className='mini-container'>
				<div className='board-container'>
					<div ref={boardRef} className='board' dangerouslySetInnerHTML={{__html: body.board}}></div>
				</div>
				<div className='clues'>
					{body.clueLists.map((list, index) => {
						return (<div key={index}>
							<h4 className='clue-set'>{list.name}</h4>
							<ol>
								{list.clues.map((clueIndex) => {
									const clue = body.clues[clueIndex];
									if (!clue) return null;
									return (
										<li key={clueIndex} className={`clue ${activeClues.includes(clueIndex) ? 'active-clue' : ''} ${activeClues[selectedClue] === clueIndex ? 'selected-clue' : ''}`}>
											<span className='clue-label'>{clue.label}</span> <span className="clue-text">{clue.text.map(t => t.plain).join(' ')}</span>
										</li>
									);
								}
								)}
							</ol>
						</div>);
					})}
				</div>
			</div>
			<Modal open={modalOpen} onClose={() => setModalOpen(false)} center closeIcon={<></>}>
				<h2>{modalType == "victory" ? "Congratulations!" : "Not Quite..."}</h2>
				<h3>{modalType == "victory" ? "You solved today's Mini Crossword!" : "One or more squares are filled incorrectly."}</h3>
				<button onClick={() => {setModalOpen(false)}}>{modalType == "victory" ? "Admire Puzzle" : "Keep Trying"}</button>
			</Modal>
			{/* <h4>{new Date(data.publicationDate).toLocaleDateString("en", {dateStyle: "medium"})}</h4> */}
		</>
	);
}