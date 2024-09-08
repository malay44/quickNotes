import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Note, getNotes, togglePinNote } from "@/lib/notesService";
import { PinIcon } from "lucide-react";

interface NoteListProps {
  selectedNoteId: number | null;
  onSelectNote: (note: Note) => void;
}

export function NoteList({ selectedNoteId, onSelectNote }: NoteListProps) {
  const notes = getNotes();

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {notes.map((note) => (
          <button
            key={note.id}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
              selectedNoteId === note.id && "bg-muted"
            )}
            onClick={() => onSelectNote(note)}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{note.title}</div>
                  {note.pinned && <PinIcon className="h-4 w-4 text-blue-600" />}
                </div>
                <div
                  className={cn(
                    "ml-auto text-xs",
                    selectedNoteId === note.id
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {note.date.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {note.content.substring(0, 300)}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
