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
  onChange,
}) => {
  const [blocks, setBlocks] = useState<NoteTextBlock[]>(initialContent);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const blockRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (blocks.length === 0) {
      createNewBlock();
    }
  }, []);

  console.log(blocks);

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
      onChange?.(updatedBlocks);
      return updatedBlocks;
    });
    // Force re-render
    setBlocks((prevBlocks) => [...prevBlocks]);
  };

  const applyFormatting = (formatting: "b" | "i" | "u") => {
    if (!selectedBlockId) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const blockElement = blockRefs.current[selectedBlockId];
    if (!blockElement || !blockElement.contains(range.commonAncestorContainer))
      return;

    updateBlock(selectedBlockId, (block) => {
      const newValue: TextBlockValue[] = [];
      let currentIndex = 0;

      block.value.forEach(([text, formats]) => {
        const segmentStart = currentIndex;
        const segmentEnd = segmentStart + text.length;

        if (
          range.startOffset <= segmentEnd &&
          range.endOffset >= segmentStart
        ) {
          const start = Math.max(0, range.startOffset - segmentStart);
          const end = Math.min(text.length, range.endOffset - segmentStart);

          if (start > 0) {
            newValue.push([text.slice(0, start), formats]);
          }

          const selectedText = text.slice(start, end);
          const newFormats = formats.includes(formatting)
            ? formats.filter((f) => f !== formatting)
            : [...formats, formatting];
          newValue.push([selectedText, newFormats]);

          if (end < text.length) {
            newValue.push([text.slice(end), formats]);
          }
        } else {
          newValue.push([text, formats]);
        }

        currentIndex = segmentEnd;
      });

      return { ...block, value: newValue };
    });
  };

  const handleBlockChange: React.FormEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLDivElement;
    const blockId = target.getAttribute("data-block-id");
    if (!blockId) return;

    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    const startContainer = range?.startContainer;
    const startOffset = range?.startOffset;

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

    // Restore cursor position
    setTimeout(() => {
      const updatedBlock = blockRefs.current[blockId];
      if (updatedBlock && startContainer && startOffset !== undefined) {
        const newRange = document.createRange();
        let currentNode: Node | null = updatedBlock;
        let currentOffset = 0;

        const traverse = (node: Node): boolean => {
          if (node === startContainer) {
            newRange.setStart(node, startOffset);
            newRange.setEnd(node, startOffset);
            return true;
          }

          if (node.nodeType === Node.TEXT_NODE) {
            currentOffset += node.textContent?.length || 0;
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            for (const childNode of Array.from(node.childNodes)) {
              if (traverse(childNode)) {
                return true;
              }
            }
          }

          return false;
        };

        traverse(updatedBlock);

        if (!newRange.startContainer) {
          // If the exact node wasn't found, set the cursor at the end
          newRange.setStart(updatedBlock, updatedBlock.childNodes.length);
          newRange.setEnd(updatedBlock, updatedBlock.childNodes.length);
        }

        selection?.removeAllRanges();
        selection?.addRange(newRange);
      }
    }, 0);
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
    return value.map(([text, formatting], index) => (
      <span key={index} className={formattingToClass(formatting)}>
        {text}
      </span>
    ));
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
