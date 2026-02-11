import { renderClue } from "@/lib/formatting";
import { GlobalState } from "@/lib/GlobalState";
import type { MiniCrossword } from "@/lib/types";
import { pb } from "@/main";
import { PencilIcon, UploadCloudIcon } from "lucide-react";
import { useContext, useEffect, useLayoutEffect, useRef, useState, type SetStateAction } from "react";
import {
  Box,
  Button,
  ButtonToolbar,
  Checkbox,
  CheckboxGroup,
  Form,
  Heading,
  HStack,
  Input,
  Modal,
  PinInput,
  useDialog,
  VStack
} from "rsuite";
import Shapes from "./Shapes";

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Create() {
  const [data, setData] = useState<MiniCrossword | null>(null);
  const [editingClue, setEditingClue] = useState<number | null>(null);
  const [clueInputText, setClueInputText] = useState<string>("");
  const [clueAnswerText, setClueAnswerText] = useState<string>("");
  const [editingDetails, setEditingDetails] = useState<boolean>(false);
  const [details, setDetails] = useState({ name: "Untitled Puzzle", public: true });
  const [hoveringClue, setHoveringClue] = useState(-1);

  const boardRef = useRef<HTMLDivElement>(null);
  const dialog = useDialog();
  const { user } = useContext(GlobalState);

  const type = "mini";

  useEffect(() => {
    document.title = "Create Custom Puzzle - Glyph";
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/custom/favicon.svg`);

    // pb.collection("shapes")
    //   .getFirstListItem("sort_order=5")
    //   .then((shape) => {
    //     setData(shape.data as MiniCrossword);
    //   });
  }, []);

  useLayoutEffect(() => {
    if (boardRef.current && data) {
      boardRef.current.innerHTML = data.body[0].board;
      const cells = boardRef.current.querySelectorAll(".cell");
      cells.forEach((cell) => {
        const parent = cell.parentElement;
        if (!parent) return;
        const index = parseInt(parent.getAttribute("data-index") || "-1", 10);
        if (isNaN(index) || index < 0) return;
        const guess: SVGTextElement | null = parent.querySelector(".guess");

        if (guess && data.body[0].cells[index] && data.body[0].cells[index].answer) {
          guess.textContent = data.body[0].cells[index].answer;
        } else if (guess) {
          guess.textContent = "";
        }

        if (data.body[0].cells[index].clues?.includes(hoveringClue)) {
          cell.classList.add("highlighted");
        }
      });
    }
  });

  if (data) {
    const body = data.body[0];

    function getClueAnswer(clueIndex: number) {
      const clue = body.clues[clueIndex];
      if (!clue) return "";
      let answer = "";
      clue.cells.forEach((cellIndex) => {
        const cell = body.cells[cellIndex];
        if (cell && cell.answer) {
          answer += cell.answer;
        } else {
          answer += " ";
        }
      });
      return answer;
    }

    function generateId() {
      const min = 1000000000;
      const max = 9999999999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async function publish() {
      if (!data) return;
      if (!user || !pb.authStore.isValid) {
        dialog.alert("You must be logged in to publish.", { title: "Error" });
        return;
      }
      const response = await dialog.confirm(
        `Are you sure you want to publish your puzzle under the name ${user.username}? Don't include sensitive information in public puzzles.`
      );
      if (!response) return;
      const puzzleId = generateId();
      const customPuzzles = pb.collection("custom_puzzles");
      data.publicationDate = getTodayDateString();
      data.copyright = new Date().getFullYear().toString();
      data.constructors = [user.username];
      data.lastUpdated = "";
      data.id = puzzleId;
      const record = {
        id: puzzleId.toString().padEnd(15, "0"),
        author: user.id,
        title: details.name || "Untitled Puzzle",
        puzzle: data,
        public: true
      };
      customPuzzles
        .create(record)
        .then(() => {
          dialog.alert("Puzzle published successfully!", { title: "Success" });
        })
        .catch((err) => {
          console.error(err);
          dialog.alert("An error occurred while publishing the puzzle. It has been saved locally.", { title: "Error" });
        });
    }

    return (
      <>
        <HStack alignItems={"stretch"} spacing={0} className={`mini-container`}>
          <VStack className="board-container">
            <div ref={boardRef} className={`board board-${type}`} dangerouslySetInnerHTML={{ __html: body.board }}></div>
            <ButtonToolbar className="toggle-container" justifyContent={"center"}>
              <Button
                appearance="primary"
                color="blue"
                startIcon={<PencilIcon />}
                onClick={() => {
                  setEditingDetails(true);
                }}
              >
                Details
              </Button>
              <Button appearance="primary" color="green" startIcon={<UploadCloudIcon />} onClick={publish}>
                Publish
              </Button>
            </ButtonToolbar>
          </VStack>
          <div className="clues">
            {body.clueLists.map((list, index) => {
              return (
                <div key={index}>
                  <Heading level={4} style={{ textAlign: "left" }} className="clue-set">
                    {list.name}
                  </Heading>
                  <ol>
                    {list.clues.map((clueIndex) => {
                      const clue = body.clues[clueIndex];
                      if (!clue) return null;
                      return (
                        <li
                          key={clueIndex}
                          className={`clue${hoveringClue === clueIndex ? " active-clue" : ""}`}
                          onClick={() => {
                            setEditingClue(clueIndex);
                            setClueInputText(body.clues[clueIndex].text[0].plain);
                            setClueAnswerText(getClueAnswer(clueIndex));
                          }}
                          onMouseEnter={() => {
                            setHoveringClue(clueIndex);
                          }}
                          onMouseLeave={() => {
                            setHoveringClue(-1);
                          }}
                        >
                          <span className="clue-label">{clue.label}</span>{" "}
                          <span className="clue-text" dangerouslySetInnerHTML={{ __html: renderClue(clue) }}></span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              );
            })}
          </div>
        </HStack>

        <Modal
          open={editingClue !== null}
          onClose={() => {
            setEditingClue(null);
          }}
        >
          <Modal.Header>
            <Modal.Title>
              <PencilIcon /> Edit Clue
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editingClue !== null && (
              <>
                <VStack spacing={10}>
                  <Box width={"100%"}>
                    <Heading level={3} textAlign={"left"}>
                      Clue
                    </Heading>
                    <Input
                      value={clueInputText}
                      onChange={(e) => {
                        setClueInputText(e);
                      }}
                    />
                  </Box>
                  <div>
                    <Heading level={3} textAlign={"left"}>
                      Answer
                    </Heading>
                    <PinInput
                      length={body.clues[editingClue].cells.length}
                      attached
                      type={"alphanumeric"}
                      value={clueAnswerText}
                      onChange={(val) => {
                        setClueAnswerText(val.toUpperCase());
                      }}
                    />
                  </div>
                </VStack>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              appearance="primary"
              onClick={() => {
                const newBody = { ...body };
                newBody.clues[editingClue!].text[0].plain = clueInputText;
                newBody.clues[editingClue!].text[0].formatted = clueInputText;
                for (let i = 0; i < newBody.clues[editingClue!].cells.length; i++) {
                  const cellIndex = newBody.clues[editingClue!].cells[i];
                  if (newBody.cells[cellIndex]) {
                    newBody.cells[cellIndex].answer = clueAnswerText[i] || "";
                  }
                }
                setData({ ...data, body: [newBody] });
                setEditingClue(null);
              }}
            >
              Save
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          open={editingDetails}
          onClose={() => {
            setEditingDetails(false);
          }}
        >
          <Modal.Title>
            <PencilIcon /> Edit Details
          </Modal.Title>
          <Modal.Body>
            <Form
              fluid
              onChange={(formValue) => {
                setDetails(formValue as SetStateAction<{ name: string; public: boolean }>);
              }}
              formValue={details}
              onSubmit={() => {
                setEditingDetails(false);
              }}
            >
              <Form.Group>
                <Form.Label>Puzzle Name</Form.Label>
                <Form.Control name="name"></Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Control name="options" accepter={CheckboxGroup}>
                  <Checkbox value={"public"}>Publish Publicly</Checkbox>
                </Form.Control>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button appearance="primary">Save</Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  } else {
    return <Shapes />;
  }
}
