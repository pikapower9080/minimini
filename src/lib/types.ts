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

interface MiniCrosswordBody {
  board: string;
  cells: MiniCrosswordCell[];
  clueLists: MiniCrosswordClueList[];
  clues: MiniCrosswordClue[];
  dimensions: MiniCrosswordDimensions;
}

interface MiniCrosswordCell {
  answer?: string;
  clues?: number[];
  label?: string;
  type?: number;
}

interface MiniCrosswordClueList {
  clues: number[];
  name: string;
}

interface MiniCrosswordClue {
  cells: number[];
  direction: string;
  label: string;
  list?: number;
  text: MiniCrosswordClueText[];
}

interface MiniCrosswordClueText {
  formatted?: string;
  plain: string;
}

interface MiniCrosswordDimensions {
  height: number;
  width: number;
}