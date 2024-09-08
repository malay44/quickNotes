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
    id: "73a69dff-65d1-4d4a-b844-484f698f1e8a",
    type: "text",
    align: "left",
    fontSize: 16,
    value: [
      ["Hello, w", ["b"]],
      ["0rld! ", []],
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
  const [selectionState, setSelectionState] = useState<{
    blockId: string;
    start: number;
    end: number;
  } | null>(null);

  useEffect(() => {
    if (blocks.length === 0) {
      createNewBlock();
    }
  }, []);

  useEffect(() => {
    if (selectionState) {
      const { blockId, start, end } = selectionState;
      const block = blockRefs.current[blockId];
      if (block) {
        const range = document.createRange();
        const selection = window.getSelection();

        // Find the correct text node and offset
        let currentOffset = 0;
        let startNode: Node | null = null;
        let endNode: Node | null = null;

        const traverse = (node: Node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const length = node.textContent?.length || 0;
            if (!startNode && currentOffset + length >= start) {
              startNode = node;
              range.setStart(node, start - currentOffset);
            }
            if (!endNode && currentOffset + length >= end) {
              endNode = node;
              range.setEnd(node, end - currentOffset);
              return true;
            }
            currentOffset += length;
          } else {
            for (const childNode of Array.from(node.childNodes)) {
              if (traverse(childNode)) return true;
            }
          }
          return false;
        };

        traverse(block);

        if (startNode && endNode && selection) {
          selection.removeAllRanges();
          selection.addRange(range);
          // Ensure the block is focused
          block.focus();
        }
      }
    }
  }, [selectionState, blocks]);

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

  const applyFormatting = (newFormatting: "b" | "i" | "u") => {
    if (!selectedBlockId) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const {
      startContainer,
      endContainer,
      startOffset,
      endOffset,
      commonAncestorContainer,
    } = selection.getRangeAt(0);

    const blockElement = blockRefs.current[selectedBlockId];
    if (!blockElement || !blockElement.contains(commonAncestorContainer))
      return;

    const firstSelectedTokenIndex = Number(
      startContainer.parentElement?.getAttribute("data-token-index") || 0
    );
    const lastSelectedTokenIndex = Number(
      endContainer.parentElement?.getAttribute("data-token-index") || 0
    );

    // Store the current selection state
    const currentSelectionState = {
      blockId: selectedBlockId,
      start: getTextOffset(blockElement, startContainer, startOffset),
      end: getTextOffset(blockElement, endContainer, endOffset),
    };

    updateBlock(selectedBlockId, (block) => {
      const newValue: TextBlockValue[] = [];

      const allSelectedTokens = block.value.slice(
        firstSelectedTokenIndex,
        lastSelectedTokenIndex + 1
      );
      const invertFormatting = allSelectedTokens.every(([, formats]) =>
        formats.includes(newFormatting)
      );

      const applyFormattingToSegment = (
        text: string,
        formats: Array<"b" | "i" | "u" | undefined>,
        start: number,
        end: number
      ) => {
        if (start > 0) {
          newValue.push([text.slice(0, start), formats]);
        }

        const newFormats = formats.includes(newFormatting)
          ? invertFormatting
            ? formats.filter((f) => f !== newFormatting)
            : formats
          : [...formats, newFormatting];
        if (start !== end) {
          newValue.push([text.slice(start, end), newFormats]);
        }
        if (end < text.length) {
          newValue.push([text.slice(end), formats]);
        }
      };

      // if the selection is a single token, apply the formatting to the token
      if (allSelectedTokens.length === 1) {
        const [text, formats] = block.value[firstSelectedTokenIndex];
        if (firstSelectedTokenIndex > 0) {
          const tokensBefore = block.value.slice(0, firstSelectedTokenIndex);
          newValue.push(...tokensBefore);
        }
        applyFormattingToSegment(text, formats, startOffset, endOffset);
        if (firstSelectedTokenIndex < block.value.length - 1) {
          const tokensAfter = block.value.slice(firstSelectedTokenIndex + 1);
          newValue.push(...tokensAfter);
        }
      } else {
        block.value.forEach(([text, formats], index) => {
          if (index === firstSelectedTokenIndex) {
            applyFormattingToSegment(text, formats, startOffset, text.length);
          } else if (index === lastSelectedTokenIndex) {
            applyFormattingToSegment(text, formats, 0, endOffset);
          } else if (
            index > firstSelectedTokenIndex &&
            index < lastSelectedTokenIndex
          ) {
            const newFormats = invertFormatting
              ? formats.filter((f) => f !== newFormatting)
              : Array.from(new Set([...formats, newFormatting]));
            newValue.push([text, newFormats]);
          } else {
            newValue.push([text, formats]);
          }
        });
      }

      // merge nodes with same formats
      const mergedValue: TextBlockValue[] = [];
      newValue.forEach(([text, formats]) => {
        formats.sort();
        if (
          mergedValue.length > 0 &&
          mergedValue[mergedValue.length - 1][1].join("") === formats.join("")
        ) {
          mergedValue[mergedValue.length - 1][0] += text;
        } else {
          mergedValue.push([text, formats]);
        }
      });

      return { ...block, value: mergedValue };
    });

    // Restore the selection state after formatting
    setSelectionState(currentSelectionState);
  };

  const handleBlockChange: React.FormEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLDivElement;
    const blockId = target.getAttribute("data-block-id");
    if (!blockId) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const blockElement = blockRefs.current[blockId];
      if (blockElement) {
        const start = getTextOffset(
          blockElement,
          range.startContainer,
          range.startOffset
        );
        const end = getTextOffset(
          blockElement,
          range.endContainer,
          range.endOffset
        );
        setSelectionState({ blockId, start, end });
      }
    }

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
    return value.map(([text, formatting], index) => (
      <span
        key={index}
        data-token-index={index}
        className={formattingToClass(formatting)}
      >
        {text}
      </span>
    ));
  };

  const getTextOffset = (root: Node, target: Node, offset: number): number => {
    let totalOffset = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (walker.currentNode === target) {
        return totalOffset + offset;
      }
      totalOffset += walker.currentNode.textContent?.length || 0;
    }
    return totalOffset;
  };

  // Add this function to handle selection changes
  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const blockElement = range.commonAncestorContainer.parentElement;
      const blockId = blockElement?.getAttribute("data-block-id");

      if (blockId && blockRefs.current[blockId]) {
        // Add a null check for blockElement
        if (blockElement) {
          const start = getTextOffset(
            blockElement,
            range.startContainer,
            range.startOffset
          );
          const end = getTextOffset(
            blockElement,
            range.endContainer,
            range.endOffset
          );
          setSelectionState({ blockId, start, end });
        }
      }
    }
  };

  // Add this useEffect to listen for selection changes
  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  return (
    <div className="p-2 h-full">
      <div className="flex gap-2 mb-2">
        <Button
          variant="outline"
          onClick={() => applyFormatting("b")}
        >
          B
        </Button>
        <Button variant="outline" onClick={() => applyFormatting("i")}>
          I
        </Button>
        <Button variant="outline" onClick={() => applyFormatting("u")}>
          U
        </Button>
        <Button variant="outline" onClick={() => handleAlignment("left")}>
          Left
        </Button>
        <Button variant="outline" onClick={() => handleAlignment("center")}>
          Center
        </Button>
        <Button variant="outline" onClick={() => handleAlignment("right")}>
          Right
        </Button>
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
            onBlur={() => {
              // Clear the selection when the block loses focus
              setSelectionState(null);
            }}
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
