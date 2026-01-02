import { useContext, type RefObject } from "react";
import posthog from "posthog-js";
import { DoorOpenIcon, MenuIcon, PrinterIcon, RotateCcwIcon, TrophyIcon } from "lucide-react";

import type { MiniCrossword } from "@/lib/types";
import { Menu, MenuDivider, MenuItem } from "@szhsin/react-menu";
import { MiniState } from "@/routes/mini/state";
import { pb, pb_url } from "@/main";
import { GlobalState } from "@/lib/GlobalState";

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
  const { type } = useContext(MiniState);

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
        onClick={() => {
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
      >
        <RotateCcwIcon />
        Reset Puzzle
      </MenuItem>
    </Menu>
  );
}
