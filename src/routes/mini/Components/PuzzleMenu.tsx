import { useContext, type RefObject } from "react";
import posthog from "posthog-js";
import { DoorOpenIcon, MenuIcon, PrinterIcon, RotateCcwIcon, TrophyIcon } from "lucide-react";

import type { MiniCrossword } from "@/lib/types";
import { Menu, MenuDivider, MenuItem } from "@szhsin/react-menu";
import { MiniState } from "@/routes/mini/state";
import { pb, pb_url } from "@/main";
import { GlobalState } from "@/lib/GlobalState";
import { useDialog } from "rsuite";

export default function PuzzleMenu({
  data,
  clearLocalPuzzleData,
  stateDocId,
  setPuzzleModalState,
  complete
}: {
  data: MiniCrossword;
  clearLocalPuzzleData: () => Promise<void>;
  stateDocId: RefObject<string>;
  setPuzzleModalState: (state: any) => void;
  complete: boolean;
}) {
  const { user } = useContext(GlobalState);
  const { type, options } = useContext(MiniState);
  const dialog = useDialog();

  return (
    <Menu portal transition align="end" menuButton={<MenuIcon />}>
      {user ? (
        <>
          <MenuItem
            onClick={() => {
              setPuzzleModalState("leaderboard");
            }}
            disabled={!complete}
          >
            <TrophyIcon />
            Leaderboard
          </MenuItem>
          <MenuDivider />
        </>
      ) : (
        ""
      )}
      <MenuItem
        onClick={() => {
          location.reload();
        }}
      >
        <DoorOpenIcon />
        Exit
      </MenuItem>
      {type === "crossword" && (
        <MenuItem
          onClick={async () => {
            const archive = pb.collection("archive");
            const item = await archive.getFirstListItem(`crossword_id="${data.id}"`, {
              fields: "id,media"
            });
            if (item.media && item.media.length > 0) {
              const printout = item.media.find((m: string) => m.endsWith("printout.pdf"));
              if (!printout) {
                alert("This puzzle can't be printed at this time.");
              }
              window.open(`${pb_url}/api/files/archive/${item.id}/${printout}`, "_blank");
            } else {
              alert("This puzzle can't be printed at this time.");
            }
          }}
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
        disabled={options.includes("hardcore")}
      >
        <RotateCcwIcon />
        Reset Puzzle
      </MenuItem>
    </Menu>
  );
}
