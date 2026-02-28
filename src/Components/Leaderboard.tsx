import { MiniState } from "@/routes/mini/state";
import { LogInIcon, MonitorIcon, SmartphoneIcon, StarIcon, TrophyIcon, UsersIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button, Center, Checkbox, Loader, Modal, Tooltip, Whisper } from "rsuite";
import { Table } from "rsuite/Table";
import { formatDuration } from "../lib/formatting";
import { GlobalState } from "../lib/GlobalState";
import type { LeaderboardRecord, MiniCrossword, StateRecord } from "../lib/types";
import { pb } from "../main";
import Nudge from "./Nudge";

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
  const { setModalState, setComplete } = useContext(MiniState);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
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

  function ModalHeader() {
    return (
      <Modal.Header closeButton>
        <Modal.Title>
          <TrophyIcon /> Leaderboard
        </Modal.Title>
      </Modal.Header>
    );
  }

  if (!user) {
    return (
      <Modal
        centered
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        size="fit-content"
        overflow={false}
      >
        <ModalHeader />
        <Modal.Body>
          <Nudge
            title="Compete with Friends"
            body="Sign in to access the leaderboard and compete with friends"
            color="var(--rs-yellow-500)"
            className="icon-bg leaderboard-nudge"
            cta={
              <Button
                appearance="ghost"
                startIcon={<LogInIcon />}
                onClick={() => {
                  setComplete(false);
                  setModalState("sign-in");
                }}
              >
                Sign In
              </Button>
            }
          />
        </Modal.Body>
      </Modal>
    );
  }

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
      <ModalHeader />
      <Modal.Body>
        <div className="leaderboard-container" style={{ minWidth: "320px" }}>
          {data && !loading && (
            <>
              <Table data={data} bordered autoHeight maxHeight={408}>
                <Table.Column width={40} align="center" verticalAlign="center">
                  <Table.HeaderCell>#</Table.HeaderCell>
                  <Table.Cell dataKey="rank" />
                </Table.Column>
                <Table.Column flexGrow={2} align="left" verticalAlign="center">
                  <Table.HeaderCell>Username</Table.HeaderCell>
                  <Table.Cell dataKey="expand.user.username" className="leaderboard-username" />
                </Table.Column>
                <Table.Column width={20} align="center" verticalAlign="center">
                  <Table.HeaderCell> </Table.HeaderCell>
                  <Table.Cell
                    dataKey="hardcore"
                    renderCell={(hardcore) =>
                      hardcore ? (
                        <Whisper placement="top" trigger={"hover"} speaker={<Tooltip>Hardcore mode</Tooltip>}>
                          <StarIcon style={{ color: "var(--rs-orange-600)", fill: "var(--rs-orange-600)" }} />
                        </Whisper>
                      ) : (
                        ""
                      )
                    }
                  ></Table.Cell>
                </Table.Column>
                <Table.Column width={20} align="center" verticalAlign="center">
                  <Table.HeaderCell> </Table.HeaderCell>
                  <Table.Cell
                    dataKey="platform"
                    renderCell={(platform) =>
                      platform === "mobile" ? (
                        <Whisper placement="top" trigger={"hover"} speaker={<Tooltip>Mobile</Tooltip>}>
                          <SmartphoneIcon />
                        </Whisper>
                      ) : (
                        <Whisper placement="top" trigger={"hover"} speaker={<Tooltip>Desktop</Tooltip>}>
                          <MonitorIcon />
                        </Whisper>
                      )
                    }
                  ></Table.Cell>
                </Table.Column>
                <Table.Column flexGrow={1} align="center" verticalAlign="center">
                  <Table.HeaderCell>Time</Table.HeaderCell>
                  <Table.Cell dataKey="time" renderCell={(c) => formatDuration(c)} />
                </Table.Column>
                <Table.Column width={50} align="center" verticalAlign="center">
                  <Table.HeaderCell>Hints</Table.HeaderCell>
                  <Table.Cell dataKey="cheated" renderCell={(c) => <Checkbox checked={c} readOnly />} />
                </Table.Column>
              </Table>
              {user.friends.length === 0 && (
                <Center marginTop={10}>
                  <Nudge
                    title="Add Friends to Compete"
                    body="When you add friends, you can see their scores on the leaderboard"
                    color="var(--rs-violet-500)"
                    className="icon-bg friends-nudge"
                    width={320}
                    cta={
                      <Button appearance="ghost" startIcon={<UsersIcon />} onClick={() => navigate("/#friends")}>
                        Friends
                      </Button>
                    }
                  />
                </Center>
              )}
            </>
          )}
        </div>

        {loading && <Loader center backdrop />}
      </Modal.Body>
    </Modal>
  );
}
