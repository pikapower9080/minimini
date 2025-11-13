import { useContext, useEffect, useState } from "react";
import Modal from "react-responsive-modal";
import { pb } from "../main";
import { Checkbox, Loader, Table, Text } from "rsuite";
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
        const puzzleState = pb.collection("puzzle_state");
        const filter = `complete = true && puzzle_id = "${puzzleData.id}"`;
        const leaderboardData = await puzzleState.getList(1, 50, {
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
      center
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      onAnimationEnd={() => {
        if (open) setReady(true);
        else {
          setReady(false);
          setLoading(true);
          setData([]);
        }
      }}
    >
      <div className="modal-title">
        <h2>
          <FontAwesomeIcon icon={faTrophy} /> Leaderboard
        </h2>
      </div>
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
              <Text style={{ marginTop: 10 }} weight="bold">
                Add friends to compare scores
              </Text>
            )}
          </>
        )}
      </div>

      {loading && <Loader center backdrop />}
    </Modal>
  );
}
