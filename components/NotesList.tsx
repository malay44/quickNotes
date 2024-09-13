"use client";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Note,
  setSelectedNoteId,
  undoDelete,
  redoDelete,
  loadDeletedNotes,
  loadRedoableNotes,
} from "@/Redux/notesSlice";
import { PinIcon, Search, Undo, Redo } from "lucide-react";
import { RootState } from "@/Redux/store";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function NoteList() {
  const notes = useSelector((state: RootState) => state.notes.notes);
  const selectedNoteId = useSelector(
    (state: RootState) => state.notes.selectedNoteId
  );
  const [searchQuery, setSearchQuery] = useState("");

  const dispatch = useDispatch();

  const handleSelectNote = (note: Note) => {
    dispatch(setSelectedNoteId(note.id));
  };

  const deletedNotes =
    useSelector((state: RootState) => state.notes.deletedNotes) || [];
  const redoableNotes =
    useSelector((state: RootState) => state.notes.redoableNotes) || [];

  useEffect(() => {
    const storedDeletedNotes = sessionStorage.getItem("deletedNotes");
    const storedRedoableNotes = sessionStorage.getItem("redoableNotes");

    if (storedDeletedNotes) {
      try {
        const parsedDeletedNotes = JSON.parse(storedDeletedNotes);
        if (Array.isArray(parsedDeletedNotes)) {
          dispatch(loadDeletedNotes(parsedDeletedNotes));
        }
      } catch (error) {
        console.error("Error parsing stored deletedNotes", error);
        sessionStorage.removeItem("deletedNotes");
      }
    }

    if (storedRedoableNotes) {
      try {
        const parsedRedoableNotes = JSON.parse(storedRedoableNotes);
        if (Array.isArray(parsedRedoableNotes)) {
          dispatch(loadRedoableNotes(parsedRedoableNotes));
        }
      } catch (error) {
        console.error("Error parsing stored redoableNotes", error);
        sessionStorage.removeItem("redoableNotes");
      }
    }
  }, [dispatch]);

  const handleUndo = () => {
    dispatch(undoDelete());
  };

  const handleRedo = () => {
    dispatch(redoDelete());
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="relative mb-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            onClick={handleUndo}
            disabled={deletedNotes.length === 0}
            className="flex-1"
          >
            <Undo className="mr-2 h-4 w-4" />
            Undo ({deletedNotes.length})
          </Button>
          <Button
            onClick={handleRedo}
            disabled={redoableNotes.length === 0}
            className="flex-1"
          >
            <Redo className="mr-2 h-4 w-4" />
            Redo ({redoableNotes.length})
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="flex flex-col gap-2 p-4 pt-0">
          {filteredNotes.map((note) => (
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
                    {note.pinned && (
                      <PinIcon className="h-4 w-4 text-blue-600" />
                    )}
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
    </>
  );
}
