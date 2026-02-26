import { useContext, useEffect, useRef, useState } from "react";
import { Modal } from "rsuite";
import { Badge, Button, Calendar, Loader, Text, VStack } from "rsuite";
import posthog from "posthog-js";
import { ArchiveIcon, CircleCheckIcon, HourglassIcon } from "lucide-react";

import { pb } from "@/main";
import type { ArchiveRecord, ArchiveStateRecord, BasicArchiveRecord, MiniCrossword } from "@/lib/types";
import { formatDuration } from "@/lib/formatting";
import { MiniState } from "@/routes/mini/state";

function getMonthFilter(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `publication_date ~ "${year}-${month}"`;
}

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
  const dataCache = useRef<{ [month: string]: BasicArchiveRecord[] }>({});
  const puzzleStateCache = useRef<{ [month: string]: ArchiveStateRecord[] }>({});

  const archive = pb.collection("archive");
  const puzzleState = pb.collection("puzzle_state");

  const { setData: setPuzzleData, type }: { setData: (x: MiniCrossword) => void; type: "mini" | "daily" | "midi" } = useContext(MiniState);

  useEffect(() => {
    if (!data && open) {
      async function fetchData() {
        const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
        const monthFilter = getMonthFilter(selectedDateObj);
        if (dataCache.current[monthFilter]) {
          setData(dataCache.current[monthFilter]);
          setPuzzleStates(puzzleStateCache.current[monthFilter]);
          return;
        }
        const list = (await archive.getFullList({
          fields: "mini_id,daily_id,midi_id,publication_date,id",
          filter: `${type}_id!=0 && ${monthFilter}`
        })) as BasicArchiveRecord[];

        let stateFilter = `user="${pb.authStore?.record?.id}"`;

        if (list.length > 0) {
          stateFilter += ` && (${list.map((x) => `puzzle_id = "${x[`${type}_id`]}"`).join(" || ")})`;
        }

        let completed: ArchiveStateRecord[] = [];

        if (list.length > 0) {
          completed = (await puzzleState.getFullList({
            fields: "puzzle_id,complete,time",
            filter: stateFilter
          })) as ArchiveStateRecord[];
        }

        setData(list);
        setPuzzleStates(completed ?? []);
        dataCache.current[getMonthFilter(new Date(selectedDate))] = list;
        puzzleStateCache.current[getMonthFilter(new Date(selectedDate))] = completed ?? [];
      }
      fetchData();
    }
  }, [open, data]);

  function onSelectionChange() {
    if (selectedDate && data) {
      const puzzle = data.find((r) => r.publication_date === selectedDate);
      if (!puzzle) {
        setSelectedPuzzleState("not-found");
        setSelectedPuzzleTime(0);
        return;
      }
      const puzzleState = puzzleStates?.find((ps) => ps.puzzle_id === puzzle[`${type}_id`]);
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

  function onMonthChange(newMonth: Date) {
    if (dataCache.current[getMonthFilter(newMonth)] === undefined) {
      setData(null);
      setPuzzleStates(null);
    } else {
      const monthKey = getMonthFilter(newMonth);
      setData(dataCache.current[monthKey] || null);
      setPuzzleStates(puzzleStateCache.current[monthKey] || null);
    }
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)} centered overflow={false}>
      <VStack spacing={10}>
        <Modal.Header closeButton>
          <Modal.Title>
            <ArchiveIcon /> Archive
          </Modal.Title>
          <Text>Solve past puzzles</Text>
        </Modal.Header>
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
            const puzzle = data?.find((r) => r.publication_date === day);
            if (!puzzle) {
              return <Badge className="archive-badge" style={{ visibility: "hidden" }} />;
            }
            const puzzleState = puzzleStates?.find((ps) => ps.puzzle_id === puzzle[`${type}_id`]);
            if (puzzleState?.complete) {
              return <CircleCheckIcon className="archive-badge-icon archive-badge-icon-completed" />;
            }
            if (puzzleState) {
              return <HourglassIcon className="archive-badge-icon archive-badge-icon-incomplete" />;
            }
            return <Badge className="archive-badge" />;
          }}
          defaultValue={
            selectedDate ? new Date(new Date(selectedDate).getTime() + new Date(selectedDate).getTimezoneOffset() * 60000) : undefined
          }
          weekStart={0}
          onMonthChange={onMonthChange}
        />
        <Text weight="bold" className="block centered archive-selected-info">
          {pb.authStore.isValid ? formatDuration(selectedPuzzleTime || 0) : "Sign in to track your progress"}
        </Text>
        <Button
          className="archive-action-button"
          disabled={selectedPuzzleState === "not-found" || buttonLoading}
          loading={buttonLoading}
          appearance="primary"
          onClick={() => {
            if (!data || !selectedDate) return;
            setButtonLoading(true);
            archive
              .getOne(data.find((r) => r.publication_date === selectedDate)!.id)
              .then((record) => {
                posthog.capture("load_archive_puzzle", {
                  publicationDate: record.publication_date,
                  id: record.id,
                  type
                });
                const archiveRecord = record as ArchiveRecord;
                setPuzzleData(archiveRecord[type]);
                setOpen(false);
              })
              .finally(() => {
                setButtonLoading(false);
              });
          }}
        >
          {getButtonText(selectedPuzzleState)}
        </Button>
      </VStack>
      {(!data || !puzzleStates) && <Loader center backdrop />}
    </Modal>
  );
}
