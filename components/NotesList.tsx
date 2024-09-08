"use client";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Note, setSelectedNoteId } from "@/Redux/notesSlice";
import { PinIcon } from "lucide-react";
import { RootState } from "@/Redux/store";

export function NoteList() {
  const notes = useSelector((state: RootState) => state.notes.notes);
  const selectedNoteId = useSelector(
    (state: RootState) => state.notes.selectedNoteId
  );

  const dispatch = useDispatch();

  const handleSelectNote = (note: Note) => {
    dispatch(setSelectedNoteId(note.id));
  };

  return (
    <ScrollArea className="h-[calc(100vh-120px)]">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {notes.map((note) => (
          <button
            key={note.id}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
              selectedNoteId === note.id && "bg-muted"
            )}
            onClick={() => handleSelectNote(note)}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">
                    {note.title || "New Note"}
                  </div>
                  {note.pinned && <PinIcon className="h-4 w-4 text-blue-600" />}
                </div>
                <div className="ml-auto text-xs text-muted-foreground">
                  {new Date(note.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {note.summary || "No additional text"}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
