import type { Dispatch, SetStateAction } from "react";

export interface CascadeTileProps {
  row: number;
  column: number;
}

export interface TileSpaceProps {
  column: number;
}

export interface CascadesStateProps {
  cascade: string[][];
  setCascade: Dispatch<SetStateAction<string[][]>>;
  inputRow: string[];
  setInputRow: Dispatch<SetStateAction<string[]>>;
}