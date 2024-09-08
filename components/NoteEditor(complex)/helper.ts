import { NoteTextBlock } from "@/interfaces/noteTextBlock";
import { v4 as uuidv4 } from "uuid";

export const handleKeyDown = (
  e: React.KeyboardEvent<HTMLDivElement>,
  blockId: string,
  blocks: NoteTextBlock[],
  setBlocks: React.Dispatch<React.SetStateAction<NoteTextBlock[]>>,
  createNewBlock: () => void
) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    createNewBlock();
  } else if (e.key === "Backspace" && e.currentTarget.textContent === "") {
    e.preventDefault();

    setBlocks((prevBlocks) =>
      prevBlocks.filter((block) => block.id !== blockId)
    );
    // focus on the previous block
    const previousBlock = e.currentTarget.previousElementSibling;
    if (previousBlock) {
      (previousBlock as HTMLDivElement).focus();
      // cursor at the end
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(previousBlock);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  } else if (e.key === "Tab") {
    e.preventDefault();
    const newBlock: NoteTextBlock = {
      id: uuidv4(),
      type: "text",
      align: "left",
      fontSize: 16,
      value: [["    ", [undefined]]],
    };
    setBlocks((prevBlocks) => {
      const index = prevBlocks.findIndex((block) => block.id === blockId);
      return [
        ...prevBlocks.slice(0, index + 1),
        newBlock,
        ...prevBlocks.slice(index + 1),
      ];
    });
  }
};
