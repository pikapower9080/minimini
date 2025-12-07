import { useContext, type RefObject } from "react";
import { GlobalState } from "../../../lib/GlobalState";
import { Menu, MenuDivider, MenuHeader, MenuItem } from "@szhsin/react-menu";
import localforage from "localforage";
import { pb } from "../../../main";
import posthog from "posthog-js";
import type { MiniCrossword } from "../../../lib/types";
import { LogInIcon, LogOutIcon, MenuIcon, RotateCcwIcon, TrophyIcon } from "lucide-react";

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
  const { user, setModalState } = useContext(GlobalState);

  return (
    <Menu portal transition align="end" menuButton={<MenuIcon />}>
      {user ? (
        <>
          <MenuHeader>{user.username}</MenuHeader>
          <MenuItem
            onClick={() => {
              pb.authStore.clear();
              localforage.clear().then(() => {
                window.location.reload();
              });
            }}
          >
            <LogOutIcon /> Sign out
          </MenuItem>
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
        <MenuItem
          onClick={() => {
            setModalState("sign-in");
          }}
        >
          <LogInIcon /> Sign in
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
