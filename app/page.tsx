"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Plus } from "lucide-react";
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
import { addNote, setSelectedNoteId } from "@/Redux/notesSlice";
import { RootState } from "@/Redux/store";
import NoteHeader from "@/components/NoteHeader";

export default function NotesPage() {
  const dispatch = useDispatch();

  const selectedNoteId = useSelector(
    (state: RootState) => state.notes.selectedNoteId
  );

  console.log(selectedNoteId);

  const handleNewNote = () => {
    const newNote = { title: "New Note", content: "", id: uuid() };
    dispatch(addNote(newNote));
    dispatch(setSelectedNoteId(newNote.id));
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
            <NoteHeader id={selectedNoteId} />
            <NoteEditor />
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
