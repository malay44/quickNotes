"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { NoteList } from "@/components/NotesList";
import NoteEditor from "@/components/NoteEditor";

export default function NotesPage() {
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
        <div className="flex items-center px-4 py-2">
          <h1 className="text-2xl font-bold">Notes</h1>
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
        <NoteEditor />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
