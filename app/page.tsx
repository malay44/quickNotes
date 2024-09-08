"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Plus, Trash, Pin } from "lucide-react";
import { v4 as uuid } from "uuid";

import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { NoteList } from "@/components/NotesList";
import NoteEditor from "@/components/NoteEditor";
import { Button } from "@/components/ui/button";
import {
  addNote,
  updateNote,
  deleteNote,
  togglePinNote,
  setSelectedNoteId,
} from "@/Redux/notesSlice";
import { RootState } from "@/Redux/store";

export default function NotesPage() {
  const dispatch = useDispatch();
  const selectedNoteId = useSelector(
    (state: RootState) => state.notes.selectedNoteId
  );
  const selectedNote = useSelector((state: RootState) =>
    state.notes.notes.find((note) => note.id === selectedNoteId)
  );

  const handleNewNote = () => {
    const newNote = { title: "New Note", content: "", id: uuid() };
    dispatch(addNote(newNote));
    dispatch(setSelectedNoteId(newNote.id));
  };

  const handleUpdateNote = (title: string, content: string) => {
    if (selectedNote) {
      dispatch(updateNote({ id: selectedNote.id, title, content }));
    }
  };

  const handleDeleteNote = () => {
    if (selectedNote) {
      dispatch(deleteNote(selectedNote.id));
    }
  };

  const handleTogglePin = () => {
    if (selectedNote) {
      dispatch(togglePinNote(selectedNote.id));
    }
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={(sizes: number[]) => {
        document.cookie = `react-resizable-panels:layout:notes=${JSON.stringify(
          sizes
        )}`;
      }}
      className="items-stretch"
    >
      <ResizablePanel defaultSize={20} minSize={30}>
        <div className="flex items-center justify-between px-4 py-2">
          <h1 className="text-2xl font-bold">Notes</h1>
          <Button variant="outline" size="icon" onClick={handleNewNote}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Separator />
        <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <form>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search" className="pl-8" />
            </div>
          </form>
        </div>
        <NoteList />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={80} minSize={30}>
        {selectedNoteId ? (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-2">
              <Input
                value={selectedNote?.title}
                onChange={(e) =>
                  handleUpdateNote(e.target.value, selectedNote?.content || "")
                }
                className="text-2xl font-bold"
              />
              <div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleTogglePin}
                  className={selectedNote?.pinned ? "text-blue-600" : ""}
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
            <NoteEditor
              initialContent={selectedNote?.content || ""}
              onContentChange={(content: string) =>
                handleUpdateNote(selectedNote?.title || "", content)
              }
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              Select a note or create a new one
            </p>
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
