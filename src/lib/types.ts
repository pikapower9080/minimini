import type { AuthRecord } from "pocketbase";

export interface MiniCrossword {
  assets?: MiniCrosswordAsset[];
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
  relatives?: number[];
}

export interface MiniCrosswordClueText {
  formatted?: string;
  plain: string;
}

export interface MiniCrosswordDimensions {
  height: number;
  width: number;
}

export interface MiniCrosswordAsset {
  uri: string;
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
  crossword: MiniCrossword;
  publication_date: string;
  mini_id: number;
  crossword_id: number;
}

export interface BasicArchiveRecord {
  publication_date: string;
  mini_id: number;
  crossword_id: number;
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