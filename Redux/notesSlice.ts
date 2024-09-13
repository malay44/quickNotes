import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export interface Note {
  id: string;
  title: string;
  content: string;
  summary: string;
  date: string;
  pinned: boolean;
  glossary?: Record<string, string>;
  backgroundColor?: string; // Add this line
}

interface NotesState {
  notes: Note[];
  pinnedNotes: string[];
  selectedNoteId: string | null;
  deletedNotes: Note[]; // Add this line
  redoableNotes: Note[]; // Add this line
}

const initialState: NotesState = {
  notes: [],
  pinnedNotes: [],
  selectedNoteId: null,
  deletedNotes: [], // Ensure this is always initialized as an empty array
  redoableNotes: [], // Add this line
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    addNote: (
      state,
      action: PayloadAction<{
        title: string;
        content: string;
        id: string;
        summary?: string;
      }>
    ) => {
      const newNote: Note = {
        id: action.payload.id,
        title: action.payload.title,
        content: action.payload.content,
        summary: action.payload.summary || "",
        date: new Date().toISOString(),
        pinned: false,
      };
      state.notes.unshift(newNote);
      state.selectedNoteId = newNote.id;
    },
    updateNote: (
      state,
      action: PayloadAction<Partial<Note> & { id: string }>
    ) => {
      const index = state.notes.findIndex(
        (note) => note.id === action.payload.id
      );
      if (index !== -1) {
        state.notes[index] = { ...state.notes[index], ...action.payload };
      }
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      const deletedNote = state.notes.find((n) => n.id === action.payload);
      if (deletedNote) {
        state.deletedNotes.push(deletedNote);
        state.redoableNotes = []; // Clear redoable notes on new delete
        sessionStorage.setItem(
          "deletedNotes",
          JSON.stringify(state.deletedNotes)
        );
        sessionStorage.setItem(
          "redoableNotes",
          JSON.stringify(state.redoableNotes)
        );
      }
      state.notes = state.notes.filter((n) => n.id !== action.payload);
      state.pinnedNotes = state.pinnedNotes.filter((n) => n !== action.payload);
      state.selectedNoteId = state.notes.length > 0 ? state.notes[0].id : null;
    },
    togglePinNote: (state, action: PayloadAction<string>) => {
      const note = state.notes.find((n) => n.id === action.payload);
      if (note) {
        note.pinned = !note.pinned;
        state.notes.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
        if (note.pinned) {
          state.pinnedNotes.push(note.id);
        } else {
          state.pinnedNotes = state.pinnedNotes.filter((n) => n !== note.id);
        }
      }
    },
    setSelectedNoteId: (state, action: PayloadAction<string | null>) => {
      state.selectedNoteId = action.payload;
    },
    setGlossary: (
      state,
      action: PayloadAction<{ id: string; glossary: Record<string, string> }>
    ) => {
      const note = state.notes.find((n) => n.id === action.payload.id);
      if (note) {
        note.glossary = action.payload.glossary;
      }
    },
    undoDelete: (state) => {
      const lastDeletedNote = state.deletedNotes.pop();
      if (lastDeletedNote) {
        state.notes.unshift(lastDeletedNote);
        state.selectedNoteId = lastDeletedNote.id;
        state.redoableNotes.push(lastDeletedNote);
        sessionStorage.setItem(
          "deletedNotes",
          JSON.stringify(state.deletedNotes)
        );
        sessionStorage.setItem(
          "redoableNotes",
          JSON.stringify(state.redoableNotes)
        );
      }
    },
    redoDelete: (state) => {
      const noteToDelete = state.redoableNotes.pop();
      if (noteToDelete) {
        state.notes = state.notes.filter((n) => n.id !== noteToDelete.id);
        state.deletedNotes.push(noteToDelete);
        state.selectedNoteId =
          state.notes.length > 0 ? state.notes[0].id : null;
        sessionStorage.setItem(
          "deletedNotes",
          JSON.stringify(state.deletedNotes)
        );
        sessionStorage.setItem(
          "redoableNotes",
          JSON.stringify(state.redoableNotes)
        );
      }
    },
    loadDeletedNotes: (state, action: PayloadAction<Note[]>) => {
      state.deletedNotes = action.payload || []; // Ensure a default value
    },
    loadRedoableNotes: (state, action: PayloadAction<Note[]>) => {
      state.redoableNotes = action.payload || []; // Ensure a default value
    },
  },
});

export const {
  addNote,
  updateNote,
  deleteNote,
  togglePinNote,
  setSelectedNoteId,
  setGlossary,
  undoDelete,
  redoDelete,
  loadDeletedNotes,
  loadRedoableNotes,
} = notesSlice.actions;
export default notesSlice.reducer;
