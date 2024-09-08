import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";

interface NoteEditorProps {
  initialContent: string;
  onContentChange: (content: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  initialContent,
  onContentChange,
}) => {
  const [content, setContent] = useState(initialContent);
  const contentEditableRef = useRef<HTMLDivElement>(null);

  console.log(content);

  useEffect(() => {
    if (
      contentEditableRef.current &&
      contentEditableRef.current.innerHTML !== content
    ) {
      contentEditableRef.current.innerHTML = content;
    }
  });

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (contentEditableRef.current) {
      const newContent = contentEditableRef.current.innerHTML;
      setContent(newContent);
      onContentChange(newContent);
    }
  };

  return (
    <div className="p-2 h-full">
      <div className="flex gap-2 mb-2">
        <Button variant="outline" onClick={() => handleFormat("bold")}>
          B
        </Button>
        <Button variant="outline" onClick={() => handleFormat("italic")}>
          I
        </Button>
        <Button variant="outline" onClick={() => handleFormat("underline")}>
          U
        </Button>
        <Button variant="outline" onClick={() => handleFormat("justifyLeft")}>
          Left
        </Button>
        <Button variant="outline" onClick={() => handleFormat("justifyCenter")}>
          Center
        </Button>
        <Button variant="outline" onClick={() => handleFormat("justifyRight")}>
          Right
        </Button>
        <select
          className="border rounded-md p-1 bg-background"
          onChange={(e) => handleFormat("fontSize", e.target.value)}
          value={undefined}
        >
          {[12, 14, 16, 18, 20, 24, 28].map((size) => (
            <option key={size} value={size.toString()}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div
        className="h-full focus-visible:outline-none border rounded-md p-2"
        contentEditable="true"
        ref={contentEditableRef}
        onInput={(event) => {
          const target = event.target as HTMLDivElement;
          setContent(target.innerHTML || "");
          onContentChange(target.innerHTML || "");
        }}
      />
    </div>
  );
};

export default NoteEditor;
