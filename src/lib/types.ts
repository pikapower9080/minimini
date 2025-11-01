import type { RecordModel } from "pocketbase";

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

export interface StatEntry {
  time: number;
  cheats: boolean;
  complete: boolean;
}

export interface StatsRecord extends RecordModel {
  id: string;
  created: string;
  updated: string;
  puzzles: Record<number, StatEntry>;
}