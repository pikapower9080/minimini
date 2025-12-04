import { useContext, useEffect, useState } from "react";
import { Modal, ModalBody } from "rsuite";
import { pb } from "../main";
import { Checkbox, Loader, Text, Heading } from "rsuite";
import { Table } from "rsuite/Table";
import type { LeaderboardRecord, MiniCrossword, StateRecord } from "../lib/types";
import { formatDuration } from "../lib/formatDate";
import { GlobalState } from "../lib/GlobalState";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";

export default function Leaderboard({
  open,
  setOpen,
  puzzleData
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  puzzleData: MiniCrossword;
}) {
  const [loading, setLoading] = useState(true);
  // Safari and Chromium seem to have issues with rendering the Table component while the modal is animating, especially on high dpi displays.
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<StateRecord[]>([]);

  const { user } = useContext(GlobalState);

  useEffect(() => {
    if (!open || !ready) return;
    if (data && data.length > 0) return;
    let cancelled = false;
    async function fetchData() {
      try {
        const leaderboard = pb.collection("leaderboard");
        const filter = `puzzle_id = "${puzzleData.id}"`;
        const leaderboardData = await leaderboard.getList(1, 50, {
          sort: "+time",
          filter,
          expand: "user"
        });

        const rankedData = leaderboardData.items.map((item, i) => ({ ...item, rank: i + 1 }));

        if (!cancelled) {
          setData(rankedData as LeaderboardRecord[]);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Leaderboard fetch error:", err);
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [open, puzzleData.id, ready]);

  return (
    <Modal
      centered
      open={open}
      size="fit-content"
      overflow={false}
      onClose={() => {
        setOpen(false);
      }}
      onEntered={() => {
        setReady(true);
      }}
      onExited={() => {
        setReady(false);
        setLoading(true);
        setData([]);
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon={faTrophy} /> Leaderboard
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="leaderboard-container" style={{ minWidth: "300px" }}>
          {data && !loading && (
            <>
              <Table data={data} bordered autoHeight maxHeight={400}>
                <Table.Column flexGrow={1} align="center" verticalAlign="center">
                  <Table.HeaderCell>Rank</Table.HeaderCell>
                  <Table.Cell dataKey="rank" />
                </Table.Column>
                <Table.Column flexGrow={2} align="left" verticalAlign="center">
                  <Table.HeaderCell>Username</Table.HeaderCell>
                  <Table.Cell dataKey="expand.user.username" />
                </Table.Column>
                <Table.Column flexGrow={1} align="left" verticalAlign="center">
                  <Table.HeaderCell>Time</Table.HeaderCell>
                  <Table.Cell dataKey="time" renderCell={(c) => formatDuration(c)} />
                </Table.Column>
                <Table.Column flexGrow={1} align="center" verticalAlign="center">
                  <Table.HeaderCell>Hints</Table.HeaderCell>
                  <Table.Cell dataKey="cheated" renderCell={(c) => <Checkbox checked={c} readOnly />} />
                </Table.Column>
              </Table>
              {user.friends.length === 0 && (
                <Text style={{ marginTop: 10 }} weight="bold" className="centered block">
                  Add friends to compare scores
                </Text>
              )}
            </>
          )}
        </div>

        {loading && <Loader center backdrop />}
      </Modal.Body>
    </Modal>
  );
}
