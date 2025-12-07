import { useContext, type RefObject } from "react";
import posthog from "posthog-js";
import { DoorOpenIcon, MenuIcon, RotateCcwIcon, TrophyIcon } from "lucide-react";

import type { MiniCrossword } from "@/lib/types";
import { Menu, MenuDivider, MenuItem } from "@szhsin/react-menu";
import { MiniState } from "@/routes/mini/state";
import { pb } from "@/main";
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
  const { setModalState } = useContext(MiniState);

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
