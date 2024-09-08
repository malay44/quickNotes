import React, { useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { updateNote, deleteNote } from "@/Redux/notesSlice";
import { RootState } from "@/Redux/store";
import useDebounce from "@/hooks/useDebounce";
import { GlossaryButton } from "../GlossaryButton";

interface NoteEditorProps {}

const NoteEditor: React.FC<NoteEditorProps> = () => {
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const highlightOverlayRef = useRef<HTMLDivElement>(null);

  const selectedNoteId = useSelector(
    (state: RootState) => state.notes.selectedNoteId
  );
  const selectedNote = useSelector((state: RootState) =>
    state.notes.notes.find((note) => note.id === selectedNoteId)
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (
      contentEditableRef.current &&
      highlightOverlayRef.current &&
      contentEditableRef.current.innerHTML !== selectedNote?.content
    ) {
      contentEditableRef.current.innerHTML = selectedNote?.content || "";
      highlightOverlayRef.current.innerHTML = selectedNote?.content || "";
    }
  }, [selectedNote]);

  useEffect(() => {
    highlightGlossaryTerms();
  }, [selectedNote?.glossary]);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (contentEditableRef.current) {
      const newContent = contentEditableRef.current.innerHTML;
      dispatch(
        updateNote({ id: selectedNoteId as string, content: newContent })
      );
    }
  };

  const handleSave = () => {
    if (selectedNoteId !== null) {
      dispatch(
        updateNote({
          id: selectedNoteId,
          content: contentEditableRef.current?.innerHTML || "",
          summary: contentEditableRef.current?.innerText?.slice(0, 100) || "",
        })
      );
    }
  };

  const debouncedSave = useDebounce(handleSave, 500);

  const handleInput = () => {
    highlightGlossaryTerms();
    debouncedSave();
  };

  const handleDelete = () => {
    if (selectedNoteId !== null) {
      dispatch(deleteNote(selectedNoteId));
    }
  };

  const highlightGlossaryTerms = () => {
    if (contentEditableRef.current) {
      const content = contentEditableRef.current.innerHTML;
      let newContent = content;

      selectedNote?.glossary &&
        Object.keys(selectedNote.glossary).forEach((term) => {
          const regex = new RegExp(`\\b${term}\\b`, "gi");
          newContent = newContent.replace(
            regex,
            `<mark class="bg-yellow-200">$&</mark>`
          );
        });

      if (highlightOverlayRef.current) {
        highlightOverlayRef.current.innerHTML = newContent;
      }
    }
  };

  return (
    <div className="p-2 h-full flex flex-col">
      <div className="flex gap-2 mb-2 flex-wrap">
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
        <GlossaryButton noteId={selectedNoteId} text={selectedNote?.content} />
      </div>
      <div className="relative flex-grow overflow-auto border rounded-md">
        <div
          className="absolute inset-0 focus-visible:outline-none p-2 mb-2 h-full"
          contentEditable="true"
          ref={contentEditableRef}
          onInput={handleInput}
        />
        <div
          ref={highlightOverlayRef}
          className="absolute inset-0 pointer-events-none p-2 mb-2"
        />
      </div>
      <div className="flex gap-2 mt-2">
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={selectedNoteId === null}
        >
          Save
        </Button>
        <Button
          variant="outline"
          onClick={handleDelete}
          disabled={selectedNoteId === null}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default NoteEditor;
