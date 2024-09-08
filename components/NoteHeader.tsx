import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Pin, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  updateNote,
  deleteNote,
  togglePinNote,
  setSelectedNoteId,
} from "@/Redux/notesSlice";
import { RootState } from "@/Redux/store";

interface NoteHeaderProps {
  id: string;
}

const NoteHeader: React.FC<NoteHeaderProps> = ({ id }) => {
  const dispatch = useDispatch();
  const note = useSelector((state: RootState) =>
    state.notes.notes.find((n) => n.id === id)
  );
  if (!note) return null;
  const handleUpdateTitle = (title: string) => {
    dispatch(updateNote({ id: note.id, title, content: note.content }));
  };

  const handleDeleteNote = () => {
    dispatch(deleteNote(note.id));
    dispatch(setSelectedNoteId(null));
  };

  const handleTogglePin = () => {
    dispatch(togglePinNote(note.id));
  };

  return (
    <div className="flex justify-between items-center p-2 gap-2">
      <Input
        value={note.title}
        onChange={(e) => handleUpdateTitle(e.target.value)}
        className="text-2xl font-bold py-2 px-3 h-10"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={handleTogglePin}
        className={`h-10 w-10 ${note.pinned ? "text-blue-600" : ""}`}
      >
        <Pin className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleDeleteNote}
        className="h-10 w-10"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default NoteHeader;
