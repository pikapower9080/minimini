import { useEffect, useState } from "react";
import Modal from "react-responsive-modal";
import { Badge, Calendar, Loader } from "rsuite";
import { pb } from "../main";
import type { ArchiveRecord, BasicArchiveRecord } from "../lib/types";
import localforage from "localforage";

export function Archive({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
	const [data, setData] = useState<BasicArchiveRecord[] | null>(null);
	const [completedPuzzles, setCompletedPuzzles] = useState<number[] | null>(null);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [selectedPuzzleState, setSelectedPuzzleState] = useState<string>("unset");

	useEffect(() => {
		if (!data && open) {
			async function fetchData() {
				const archive = pb.collection("archive")
				const list = await archive.getFullList({
					fields: "puzzleId,publicationDate,id"
				}) as BasicArchiveRecord[];
				setData(list);
				const completed = await localforage.getItem<number[]>("completed");
				setCompletedPuzzles(completed || []);
			}
			fetchData();
		}
	}, [open]);

	useEffect(() => {
		if (selectedDate && data) {
			async function getPuzzleState() {
				const puzzle = data.find(r => r.publicationDate === selectedDate);
				if (!puzzle) {
					setSelectedPuzzleState("not-found");
					return;
				}
				if (completedPuzzles && completedPuzzles.includes(puzzle.puzzleId)) {
					setSelectedPuzzleState("completed");
				} else {
					localforage.getItem(`state-${puzzle.puzzleId}`).then((state) => {
						if (state) {
							setSelectedPuzzleState("incomplete");
						} else {
							setSelectedPuzzleState("not-started");
						}
					});
				}
			}
			getPuzzleState();
		}
	}, [selectedDate]);

	function getButtonText(state:string) {
		if (state === "completed") {
			return "Admire Puzzle";
		}
		if (state === "incomplete") {
			return "Continue Solving";
		}
		return "Start Solving";
	}

	return <Modal open={open} onClose={() => setOpen(false)} classNames={{modal: "archive-modal"}} center>
		<h2>Archive</h2>
		<h4>Play past puzzles</h4>
		<Calendar bordered compact className="archive-calendar" onChange={(date) => {
			const day = date.toISOString().split("T")[0];
			setSelectedDate(day);
		}} renderCell={(date) => {
			const day = date.toISOString().split("T")[0];
			const puzzle = data?.find(r => r.publicationDate === day)
			if (!puzzle) {
				return <Badge style={{visibility: "hidden"}} />
			}
			return <Badge className="archive-badge" />
		}} />
		<button className="archive-action-button" disabled={selectedPuzzleState === "not-found"}>{getButtonText(selectedPuzzleState)}</button>
		{(!data || !completedPuzzles) && <Loader center backdrop />}
	</Modal>
}