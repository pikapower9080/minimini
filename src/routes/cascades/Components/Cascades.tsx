import { Badge, Center, HStack, IconButton, VStack } from "rsuite";
import { DndProvider, useDrag, useDrop, type DragSourceMonitor } from "react-dnd";
import { HTML5toTouch } from "rdndmb-html5-to-touch";
import { MultiBackend, usePreview } from "react-dnd-multi-backend";
import { useContext, useMemo, useRef, useState } from "react";
import { ArrowRightIcon, TrashIcon } from "lucide-react";

import type { CascadesStateProps, CascadeTileProps, TileSpaceProps } from "../types";
import { cellIsActive, checkWords, dropCascade, getDefaultCascade } from "../util";
import { CascadesState } from "../state";
import { words } from "@/lib/words";

const rows = 5;
const columns = 6;

export function CascadeTilePreview() {
  const preview = usePreview();
  if (!preview.display) {
    return null;
  }
  const { itemType, item, style } = preview;
  if (itemType === "CASCADE_TILE") {
  }
}

export function CascadeTile({ row, column }: CascadeTileProps) {
  const { cascade, setCascade, setInputRow } = useContext<CascadesStateProps>(CascadesState);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "CASCADE_TILE",
      item: { row, column },
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging()
      }),
      end: (item, monitor) => {
        const dropResult: { column: number } | null = monitor.getDropResult();
        if (item && dropResult) {
          console.log(item, dropResult);
          setInputRow((prevInputRow) => {
            const newInputRow = [...prevInputRow];
            newInputRow[dropResult.column] = cascade[row][column];
            return newInputRow;
          });
          setCascade((prevCascade) => {
            const newCascade = prevCascade.map((r) => [...r]);
            newCascade[row][column] = "";
            return newCascade;
          });
        }
      }
    }),
    [cascade, row, column]
  );

  const letter = cascade[row][column];
  const active = cellIsActive(cascade, row, column);

  const classList = ["tile", "cascade-tile"];
  if (isDragging || letter === "") {
    classList.push("invisible");
  }
  if (!active) {
    classList.push("inactive");
  }

  const tile = (
    <div className="cascade-tile-container">
      <Center className={classList.join(" ")} role="Handle">
        {letter}
      </Center>
    </div>
  );

  if (active && letter !== "") {
    return drag(tile);
  } else {
    return tile;
  }
}

export function TileSpace({ column, exiting }: TileSpaceProps) {
  const { inputRow } = useContext<CascadesStateProps>(CascadesState);

  const letter = inputRow[column];
  const droppable = letter === "";
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: "CASCADE_TILE",
    drop: () => ({ column }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }));

  const classList = ["tile", "tile-space", exiting && "filled"];

  const TileSpaceContent = (
    <div className="tile-container">
      <Center className={classList.join(" ")}>{letter}</Center>
    </div>
  );

  if (droppable) {
    return drop(TileSpaceContent);
  } else {
    return TileSpaceContent;
  }
}

function DiscardButton() {
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: "CASCADE_TILE",
    drop: () => ({}),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }));

  return drop(
    <div>
      <Badge content="-5s" placement="bottomEnd">
        <IconButton appearance="primary" color="red" size="lg">
          <TrashIcon />
        </IconButton>
      </Badge>
    </div>
  );
}

function onSubmit(inputRow: string[], cascadesState: CascadesStateProps) {
  const matches = checkWords(inputRow, words);
  console.log(matches);
  if (matches.length > 0) {
    cascadesState.setCascade(dropCascade(cascadesState.cascade, cascadesState.drops));
  }
}

export default function Cascades() {
  const defaultCascade: string[][] = useMemo(() => getDefaultCascade(rows, columns), []);

  const drops = useRef<number[]>(Array(columns).fill(0));

  const [cascade, setCascade] = useState(defaultCascade);
  const [inputRow, setInputRow] = useState<string[]>(Array(columns).fill(""));

  const cascadesState = useMemo<CascadesStateProps>(
    () => ({
      cascade,
      setCascade,
      inputRow,
      setInputRow,
      drops
    }),
    [cascade, inputRow]
  );

  if (import.meta.env.DEV) {
    // @ts-ignore
    window.cascades = cascadesState;
  }

  return (
    <CascadesState.Provider value={cascadesState}>
      <Center className="cascades">
        <DndProvider backend={MultiBackend} options={HTML5toTouch}>
          <VStack spacing={15}>
            <HStack alignSelf={"center"}>
              {Array.from({ length: columns }).map((_, column) => {
                return (
                  <VStack className={`column-${column}`}>
                    {Array.from({ length: rows }).map((_, row) => {
                      return <CascadeTile key={column} row={row} column={column} />;
                    })}
                  </VStack>
                );
              })}
            </HStack>
            <VStack>
              <HStack className="input-row">
                <Center className="input-row-btn">
                  <DiscardButton />
                </Center>
                {Array.from({ length: columns }).map((_, i) => {
                  return <TileSpace key={i} column={i} exiting={false} />;
                })}
                <Center className="input-row-btn">
                  <IconButton
                    appearance="primary"
                    size="lg"
                    onClick={() => {
                      onSubmit(inputRow, cascadesState);
                    }}
                  >
                    <ArrowRightIcon />
                  </IconButton>
                </Center>
              </HStack>
            </VStack>
          </VStack>
        </DndProvider>
      </Center>
    </CascadesState.Provider>
  );
}
