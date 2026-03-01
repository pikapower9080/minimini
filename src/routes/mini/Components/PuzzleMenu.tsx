import { useContext, type RefObject } from "react";
import posthog from "posthog-js";
import { ArchiveIcon, LayoutGridIcon, MenuIcon, PrinterIcon, RotateCcwIcon, StarIcon, StarOffIcon, TrophyIcon, XIcon } from "lucide-react";

import type { MiniCrossword } from "@/lib/types";
import { Menu, MenuDivider, MenuItem } from "@szhsin/react-menu";
import { MiniState } from "@/routes/mini/state";
import { pb, pb_url } from "@/main";
import { GlobalState } from "@/lib/GlobalState";
import { useDialog } from "rsuite";
import { useNavigate } from "react-router";

export default function PuzzleMenu({
  data,
  clearLocalPuzzleData,
  stateDocId,
  setPuzzleModalState,
  onExit
}: {
  data: MiniCrossword;
  clearLocalPuzzleData: () => Promise<void>;
  stateDocId: RefObject<string>;
  setPuzzleModalState: (state: any) => void;
  onExit: (destination: string) => void;
}) {
  const { user } = useContext(GlobalState);
  const { type, options, complete, setOptions } = useContext(MiniState);
  const dialog = useDialog();
  const navigate = useNavigate();

  const hardcore = options.includes("hardcore");

  return (
    <Menu portal transition align="end" menuButton={<MenuIcon />}>
      <MenuItem
        onClick={() => {
          setPuzzleModalState("leaderboard");
        }}
        disabled={!complete}
      >
        <TrophyIcon />
        Leaderboard
      </MenuItem>
      <MenuItem
        onClick={() => {
          setPuzzleModalState("victory");
        }}
        disabled={!complete}
      >
        <StarIcon />
        Rate
      </MenuItem>
      <MenuDivider />
      <MenuItem
        onClick={() => {
          onExit("welcome");
        }}
        disabled={hardcore}
      >
        <XIcon />
        Quit
      </MenuItem>
      <MenuItem
        onClick={() => {
          onExit("archive");
        }}
        disabled={hardcore}
      >
        <ArchiveIcon />
        Archive
      </MenuItem>
      <MenuItem
        onClick={() => {
          navigate("/");
        }}
        disabled={hardcore}
      >
        <LayoutGridIcon />
        More Games
      </MenuItem>
      <MenuDivider />
      {type === "daily" && (
        <MenuItem
          onClick={async () => {
            const archive = pb.collection("archive");
            const item = await archive.getFirstListItem(`daily_id="${data.id}"`, {
              fields: "id,media"
            });
            if (item.media && item.media.length > 0) {
              const printout = item.media.find((m: string) => m.endsWith("printout.pdf"));
              if (!printout) {
                dialog.alert("This puzzle can't be printed at this time.");
              }
              window.open(`${pb_url}/api/files/archive/${item.id}/${printout}`, "_blank");
            } else {
              dialog.alert("This puzzle can't be printed at this time.");
            }
          }}
          disabled={hardcore}
        >
          <PrinterIcon />
          Print
        </MenuItem>
      )}
      <MenuItem
        onClick={async () => {
          if (user) {
            try {
              await pb.collection("leaderboard").getFirstListItem(`puzzle_id="${data.id}" && user="${user.id}"`);
            } catch (err) {
              dialog.alert("You must complete this puzzle at least once before resetting your progress.", { title: "Error" });
              return;
            }
            if (
              !(await dialog.confirm("Resetting your progress will not clear or change your leaderboard entry.", {
                title: "Are you sure?"
              }))
            ) {
              return;
            }
          }
          clearLocalPuzzleData().then(() => {
            if (user) {
              pb.collection("puzzle_state")
                .delete(stateDocId.current)
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
        disabled={hardcore}
      >
        <RotateCcwIcon />
        Reset Puzzle
      </MenuItem>
      {hardcore && (
        <MenuItem
          onClick={() => {
            setOptions((prev: string[]) => prev.filter((opt) => opt !== "hardcore"));
          }}
        >
          <StarOffIcon /> Forfeit Hardcore
        </MenuItem>
      )}
    </Menu>
  );
}
