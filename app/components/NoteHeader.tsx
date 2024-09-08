import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Pin, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateNote, deleteNote, togglePinNote } from "@/Redux/notesSlice";
import { RootState } from "@/Redux/store";

interface NoteHeaderProps {
  id: string;
}

const NoteHeader: React.FC<NoteHeaderProps> = ({ id }) => {
  const dispatch = useDispatch();
  const note = useSelector((state: RootState) =>
    state.notes.notes.find((note) => note.id === id)
  );

  if (!note) return null;

  const handleUpdateTitle = (title: string) => {
    dispatch(updateNote({ id: note.id, title, content: note.content }));
  };

  const handleDeleteNote = () => {
    dispatch(deleteNote(note.id));
  };

  const handleTogglePin = () => {
    dispatch(togglePinNote(note.id));
  };

  return (
    <div className="flex justify-between items-center p-2">
      <Input
        value={note.title || ""} // Ensure it's always a string
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleUpdateTitle(e.target.value)
        }
        className="text-2xl font-bold"
      />
      <div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleTogglePin}
          className={note.pinned ? "text-blue-600" : ""}
        >
          <Pin className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleDeleteNote}
          className="ml-2"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default NoteHeader;
