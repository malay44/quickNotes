"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, ArrowLeft } from "lucide-react";
import { v4 as uuid } from "uuid";
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
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";

export default function NotesPage() {
  const dispatch = useDispatch();
  const [isMobile, setIsMobile] = React.useState(false);

  const { setTheme } = useTheme();

  // set them based on user time
  // 6am to 8pm light theme
  // other then that dark mode
  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 20) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }, []);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const selectedNoteId = useSelector(
    (state: RootState) => state.notes.selectedNoteId
  );

  const handleNewNote = () => {
    const newNote = { title: "New Note", content: "", id: uuid() };
    dispatch(addNote(newNote));
    dispatch(setSelectedNoteId(newNote.id));
  };

  const handleBackToList = () => {
    dispatch(setSelectedNoteId(null));
  };

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-between px-4 py-2">
          {selectedNoteId ? (
            <Button variant="ghost" size="icon" onClick={handleBackToList}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : (
            <h1 className="text-2xl font-bold">Notes</h1>
          )}
          <Button variant="outline" size="icon" onClick={handleNewNote}>
            <Plus className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>
        <Separator />
        {selectedNoteId ? (
          <div className="flex flex-col flex-grow h-[calc(100vh-55px)]">
            <NoteHeader id={selectedNoteId} />
            <NoteEditor />
          </div>
        ) : (
          <NoteList />
        )}
      </div>
    );
  }

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
