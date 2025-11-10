import { useContext, useEffect, useState } from "react";
import Modal from "react-responsive-modal";
import { Badge, Button, Calendar, Loader, Text } from "rsuite";
import { pb } from "../main";
import type { ArchiveRecord, ArchiveStateRecord, BasicArchiveRecord } from "../lib/types";
import { GlobalState } from "../lib/GlobalState";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faHourglassHalf } from "@fortawesome/free-solid-svg-icons";
import { formatDuration } from "../lib/formatDate";

export function Archive({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const [data, setData] = useState<BasicArchiveRecord[] | null>(null);
  const [puzzleStates, setPuzzleStates] = useState<ArchiveStateRecord[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split("T")[0];
  });
  const [selectedPuzzleState, setSelectedPuzzleState] = useState<string>("unset");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [selectedPuzzleTime, setSelectedPuzzleTime] = useState<number>(0);

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
      }
      fetchData();
    }
  }, [open]);

  function onSelectionChange() {
    if (selectedDate && data) {
      const puzzle = data.find((r) => r.publicationDate === selectedDate);
      if (!puzzle) {
        setSelectedPuzzleState("not-found");
        setSelectedPuzzleTime(0);
        return;
      }
      const puzzleState = puzzleStates?.find((ps) => ps.puzzle_id === puzzle?.puzzleId);
      if (puzzleState) {
        setSelectedPuzzleTime(puzzleState.time || 0);
        if (puzzleState.complete) {
          setSelectedPuzzleState("completed");
        } else {
          setSelectedPuzzleState("incomplete");
        }
      } else {
        setSelectedPuzzleState("not-started");
        setSelectedPuzzleTime(0);
      }
    }
  }

  useEffect(onSelectionChange, [selectedDate]);
  useEffect(onSelectionChange, [data, puzzleStates]);

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
          const adjustedDate = new Date(date);
          adjustedDate.setHours(0, 0, 0, 0);
          const day = adjustedDate.toISOString().split("T")[0];
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
          if (puzzleState) {
            return <FontAwesomeIcon icon={faHourglassHalf} className="archive-badge-icon archive-badge-icon-incomplete" />;
          }
          return <Badge className="archive-badge" />;
        }}
        defaultValue={
          selectedDate ? new Date(new Date(selectedDate).getTime() + new Date(selectedDate).getTimezoneOffset() * 60000) : undefined
        }
        weekStart={0}
      />
      {pb.authStore.isValid && (
        <Text weight="bold" style={{ display: "block", textAlign: "center", marginBottom: 10 }}>
          {formatDuration(selectedPuzzleTime || 0)}
        </Text>
      )}
      <Button
        className="archive-action-button"
        disabled={selectedPuzzleState === "not-found" || buttonLoading}
        loading={buttonLoading}
        appearance="primary"
        onClick={() => {
          if (!data || !selectedDate) return;
          setButtonLoading(true);
          archive
            .getOne(data.find((r) => r.publicationDate === selectedDate)!.id)
            .then((record) => {
              const archiveRecord = record as ArchiveRecord;
              setPuzzleData(archiveRecord.mini);
              setOpen(false);
            })
            .finally(() => {
              setButtonLoading(false);
            });
        }}
      >
        {getButtonText(selectedPuzzleState)}
      </Button>
      {(!data || !puzzleStates) && <Loader center backdrop />}
    </Modal>
  );
}
