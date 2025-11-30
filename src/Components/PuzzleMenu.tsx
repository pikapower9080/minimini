import { useContext, type RefObject } from "react";
import { GlobalState } from "../lib/GlobalState";
import { Menu, MenuDivider, MenuHeader, MenuItem } from "@szhsin/react-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBoxArchive, faDoorOpen, faRightToBracket, faRotateLeft, faTrophy, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import localforage from "localforage";
import { pb } from "../main";
import posthog from "posthog-js";
import type { MiniCrossword } from "../lib/types";

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
    <Menu portal transition align="end" menuButton={<FontAwesomeIcon icon={faBars} />}>
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
            <FontAwesomeIcon icon={faDoorOpen}></FontAwesomeIcon>Sign out
          </MenuItem>
          <MenuItem
            onClick={() => {
              setPuzzleModalState("leaderboard");
            }}
            disabled={!complete}
          >
            <FontAwesomeIcon icon={faTrophy} />
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
          <FontAwesomeIcon icon={faRightToBracket}></FontAwesomeIcon>Sign in
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
        <FontAwesomeIcon icon={faRotateLeft} onClick={() => {}} />
        Reset Puzzle
      </MenuItem>
    </Menu>
  );
}
