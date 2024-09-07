"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { NoteTextBlock, TextBlockValue } from "@/interfaces/noteTextBlock";
import { v4 as uuidv4 } from "uuid";

interface NoteEditorProps {
  initialContent?: NoteTextBlock[];
  onChange?: (content: NoteTextBlock[]) => void;
}

const initialContent1: NoteTextBlock[] = [
  {
    id: "1",
    type: "text",
    align: "left",
    fontSize: 16,
    value: [
      ["Hello, wo", ["b"]],
      ["rld! ", []],
      ["This is a test", ["i"]],
    ],
  },
];

const NoteEditor: React.FC<NoteEditorProps> = ({
  initialContent = initialContent1,
}) => {
  const [blocks, setBlocks] = useState<NoteTextBlock[]>(initialContent);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const blockRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const cursorPositionRef = useRef<{
    container: Node;
    position: number;
  } | null>(null);
  const selectedBlockRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (blocks.length === 0) {
      createNewBlock();
    }
  }, []);

  // set cursor position
  useEffect(() => {
    if (selectedBlockId) {
      const selectBlockRef = blockRefs.current[selectedBlockId];
      if (selectBlockRef) {
        selectedBlockRef.current = selectBlockRef;
      }
    }
  }, [selectedBlockId]);

  useEffect(() => {
    if (cursorPositionRef.current?.container) {
      const range = document.createRange();
      range.setStart(
        cursorPositionRef.current.container,
        cursorPositionRef.current.position
      );
      range.collapse(true);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  });

  const createNewBlock = () => {
    const newBlock: NoteTextBlock = {
      id: uuidv4(),
      type: "text",
      align: "left",
      fontSize: 16,
      value: [["", [undefined]]],
    };
    setBlocks((prevBlocks) => [...prevBlocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const updateBlock = (
    id: string,
    updater: (block: NoteTextBlock) => NoteTextBlock
  ) => {
    setBlocks((prevBlocks) => {
      const updatedBlocks = prevBlocks.map((block) =>
        block.id === id ? updater(block) : block
      );
      return updatedBlocks;
    });
  };

  const applyFormatting = (formatting?: "b" | "i" | "u") => {};

  const handleBlockChange: React.FormEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLDivElement;
    const blockId = target.getAttribute("data-block-id");
    if (!blockId) return;

    // get the position of the cursor in the contenteditable div which has multiple nodes
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    const startContainer = range?.startContainer;
    const startOffset = range?.startOffset;

    // set the cursor position in the cursorPositionRef to be used
    // later to restore the cursor position
    cursorPositionRef.current = {
      container: startContainer as Node,
      position: startOffset || 0,
    };

    updateBlock(blockId, (block) => {
      const newValue: TextBlockValue[] = [];
      Array.from(target.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          newValue.push([node.textContent || "", []]);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          const text = element.textContent || "";
          const formats: Array<"b" | "i" | "u"> = [];

          if (element.classList.contains("font-bold")) formats.push("b");
          if (element.classList.contains("italic")) formats.push("i");
          if (element.classList.contains("underline")) formats.push("u");

          newValue.push([text, formats]);
        }
      });

      return { ...block, value: newValue };
    });
  };

  const handleAlignment = (align: "left" | "center" | "right") => {
    if (selectedBlockId) {
      updateBlock(selectedBlockId, (block) => ({ ...block, align }));
    }
  };

  const handleFontSize = (fontSize: number) => {
    if (selectedBlockId) {
      updateBlock(selectedBlockId, (block) => ({ ...block, fontSize }));
    }
  };

  const formattingToClassMap = {
    b: "font-bold",
    i: "italic",
    u: "underline",
  };

  const formattingToClass = (
    formatting: Array<"b" | "i" | "u" | undefined>
  ) => {
    return formatting.map((f) => (f ? formattingToClassMap[f] : "")).join(" ");
  };

  const renderBlockContent = (value: TextBlockValue[]) => {
    return value.map(([text, formatting], index) =>
      formatting ? (
        <span
          key={index}
          data-index={index}
          className={formattingToClass(formatting)}
        >
          {text}
        </span>
      ) : (
        text
      )
    );
  };

  return (
    <div className="p-2 h-full">
      <div className="flex gap-2 mb-2">
        <Button onClick={() => applyFormatting("b")}>B</Button>
        <Button onClick={() => applyFormatting("i")}>I</Button>
        <Button onClick={() => applyFormatting("u")}>U</Button>
        <Button onClick={() => handleAlignment("left")}>Left</Button>
        <Button onClick={() => handleAlignment("center")}>Center</Button>
        <Button onClick={() => handleAlignment("right")}>Right</Button>
        <select
          className="border rounded-md p-1 bg-background"
          onChange={(e) => handleFontSize(Number(e.target.value))}
          value={
            selectedBlockId
              ? blocks.find((b) => b.id === selectedBlockId)?.fontSize
              : undefined
          }
        >
          {[12, 14, 16, 18, 20, 24, 28].map((size) => (
            <option key={size} value={size.toString()}>
              {size}
            </option>
          ))}
        </select>
      </div>
      {/* for including the tailwind classes */}
      <span className="font-bold italic underline" />
      <div className="min-h-[200px] border p-2 rounded-md h-full">
        {blocks.map((block) => (
          <div
            key={block.id}
            data-block-id={block.id}
            ref={(el) => {
              blockRefs.current[block.id] = el;
            }}
            contentEditable
            suppressContentEditableWarning
            onInput={handleBlockChange}
            onFocus={() => setSelectedBlockId(block.id)}
            style={{
              textAlign: block.align,
              fontSize: `${block.fontSize}px`,
            }}
            className="focus-visible:outline-none"
          >
            {renderBlockContent(block.value)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoteEditor;
