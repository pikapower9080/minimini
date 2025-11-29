import type { AuthRecord } from "pocketbase";

export interface MiniCrossword {
  body: MiniCrosswordBody[];
  constructors: string[];
  copyright: string;
  id: number;
  lastUpdated: string;
  publicationDate: string;
  subcategory: number;
  freePuzzle: boolean;
}

export interface MiniCrosswordBody {
  board: string;
  cells: MiniCrosswordCell[];
  clueLists: MiniCrosswordClueList[];
  clues: MiniCrosswordClue[];
  dimensions: MiniCrosswordDimensions;
}

export interface MiniCrosswordCell {
  answer?: string;
  clues?: number[];
  label?: string;
  type?: number;
}

export interface MiniCrosswordClueList {
  clues: number[];
  name: string;
}

export interface MiniCrosswordClue {
  cells: number[];
  direction: string;
  label: string;
  list?: number;
  text: MiniCrosswordClueText[];
}

export interface MiniCrosswordClueText {
  formatted?: string;
  plain: string;
}

export interface MiniCrosswordDimensions {
  height: number;
  width: number;
}

export interface BaseRecord {
  collectionId: string;
  collectionName: string;
  created: string;
  id: string;
  updated: string;
}

export interface ArchiveRecord extends BaseRecord {
  mini: MiniCrossword;
  publicationDate: string;
  puzzleId: number;
}

export interface BasicArchiveRecord {
  publicationDate: string;
  puzzleId: number;
  id: string;
}

export interface ArchiveStateRecord extends BaseRecord {
  puzzle_id: number;
  complete: boolean;
  cheated: boolean;
  time: number;
}

export interface StateRecord extends ArchiveStateRecord {
  id: string;
  user: string;
  board_state: Record<string, string>;
  autocheck: boolean;
  selected: [number, string];
}

export interface LeaderboardRecord extends StateRecord {
  rank: number;
  expand: {
    user: {
      id: string;
      username: string;
    };
  };
}

export interface UserRecord extends BaseRecord {
  username: string;
  friends: string[];
  friend_code: string;
  avatar?: string;
}