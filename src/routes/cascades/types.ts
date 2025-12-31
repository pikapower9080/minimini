import type { Dispatch, RefObject, SetStateAction } from "react";
import type { Toaster } from "rsuite";

export interface CascadesStateProps {
  cascade: string[][];
  setCascade: Dispatch<SetStateAction<string[][]>>;
  inputRow: string[];
  setInputRow: Dispatch<SetStateAction<string[]>>;
  drops: RefObject<number[]>;
  toaster: Toaster;
}

export interface CascadeTileProps {
  row: number;
  column: number;
}

export interface TileSpaceProps {
  column: number;
  exiting: boolean;
}