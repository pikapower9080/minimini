import { useContext, useEffect, useState } from "react";
import Modal from "react-responsive-modal";
import { Badge, Calendar, Loader } from "rsuite";
import { pb } from "../main";
import type { ArchiveRecord, ArchiveStateRecord, BasicArchiveRecord } from "../lib/types";
import { GlobalState } from "../lib/GlobalState";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export function Archive({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const [data, setData] = useState<BasicArchiveRecord[] | null>(null);
  const [puzzleStates, setPuzzleStates] = useState<ArchiveStateRecord[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedPuzzleState, setSelectedPuzzleState] = useState<string>("unset");

  const archive = pb.collection("archive");
  const puzzleState = pb.collection("puzzle_state");

  const { setData: setPuzzleData } = useContext(GlobalState);

  useEffect(() => {
    if (!data && open) {
      async function fetchData() {
        const [list, completed] = await Promise.all([
          archive.getFullList({
            fields: "puzzleId,publicationDate,id"
          }) as Promise<BasicArchiveRecord[]>,
          puzzleState.getFullList({
            fields: "puzzle_id,complete,cheated,time"
          }) as Promise<any[]>
        ]);
        setData(list);
        setPuzzleStates(completed || []);
        console.log(completed);
      }
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (selectedDate && data) {
      const puzzle = data.find((r) => r.publicationDate === selectedDate);
      if (!puzzle) {
        setSelectedPuzzleState("not-found");
        return;
      }
      const puzzleState = puzzleStates?.find((ps) => ps.puzzle_id === puzzle?.puzzleId);
      if (puzzleState) {
        if (puzzleState.complete) {
          setSelectedPuzzleState("completed");
        } else {
          setSelectedPuzzleState("incomplete");
        }
      } else {
        setSelectedPuzzleState("not-started");
      }
    }
  }, [selectedDate]);

  function getButtonText(state: string) {
    if (state === "completed") {
      return "Admire Puzzle";
    }
    if (state === "incomplete") {
      return "Continue Solving";
    }
    return "Start Solving";
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)} classNames={{ modal: "archive-modal" }} center>
      <h2>Archive</h2>
      <h4>Play past puzzles</h4>
      <Calendar
        bordered
        compact
        className="archive-calendar"
        onChange={(date) => {
          const day = date.toISOString().split("T")[0];
          setSelectedDate(day);
        }}
        renderCell={(date) => {
          const day = date.toISOString().split("T")[0];
          const puzzle = data?.find((r) => r.publicationDate === day);
          const puzzleState = puzzleStates?.find((ps) => ps.puzzle_id === puzzle?.puzzleId);
          if (!puzzle) {
            return <Badge className="archive-badge" style={{ visibility: "hidden" }} />;
          }
          if (puzzleState?.complete) {
            return <FontAwesomeIcon icon={faCheckCircle} className="archive-badge-icon archive-badge-icon-completed" />;
          }
          return <Badge className="archive-badge" />;
        }}
      />
      <button
        className="archive-action-button"
        disabled={selectedPuzzleState === "not-found"}
        onClick={() => {
          if (!data || !selectedDate) return;
          archive.getOne(data.find((r) => r.publicationDate === selectedDate)!.id).then((record) => {
            const archiveRecord = record as ArchiveRecord;
            setPuzzleData(archiveRecord.mini);
            setOpen(false);
          });
        }}
      >
        {getButtonText(selectedPuzzleState)}
      </button>
      {(!data || !puzzleStates) && <Loader center backdrop />}
    </Modal>
  );
}
