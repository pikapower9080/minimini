import type { Dispatch, RefObject, SetStateAction } from "react";

export interface CascadesStateProps {
  cascade: string[][];
  setCascade: Dispatch<SetStateAction<string[][]>>;
  inputRow: string[];
  setInputRow: Dispatch<SetStateAction<string[]>>;
  drops: RefObject<number[]>;
}

export interface CascadeTileProps {
  row: number;
  column: number;
}

export interface TileSpaceProps {
  column: number;
  exiting: boolean;
}