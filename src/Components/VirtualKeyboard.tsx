import { useState } from "react";
import KeyboardReact from "react-simple-keyboard";

interface VirtualKeyboardProps {
  handleKeyDown: (event: KeyboardEvent, virtual: boolean) => void;
}

export default function VirtualKeyboard({ handleKeyDown }: VirtualKeyboardProps) {
  const [keyboardLayout, setKeyboardLayout] = useState<"default" | "numeric">("default");

  return (
    <KeyboardReact
      onKeyPress={(key) => {
        if (key === "{numbers}" || key === "{abc}") {
          setKeyboardLayout(key === "{numbers}" ? "numeric" : "default");
          return;
        }
        let keyCode = key;
        if (key === "{bksp}") keyCode = "Backspace";
        if (key === "{enter}") keyCode = "Enter";
        if (key === "{esc}") keyCode = "Escape";
        if (key === "{tab}") keyCode = "Tab";
        handleKeyDown(new KeyboardEvent("keydown", { key: keyCode }), true);
      }}
      layout={{
        default: ["Q W E R T Y U I O P", "A S D F G H J K L", "{numbers} Z X C V B N M {bksp}"],
        numeric: ["1 2 3", "4 5 6", "7 8 9", "{abc} 0 {bksp}"]
      }}
      display={{
        "{numbers}": "123",
        "{abc}": "ABC",
        "{bksp}": "⌫"
      }}
      layoutName={keyboardLayout}
      autoUseTouchEvents={true}
    />
  );
}
