import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export interface Note {
  id: string;
  title: string;
  content: string;
  date: Date;
  pinned: boolean;
}

interface NotesState {
  notes: Note[];
  pinnedNotes: string[];
  selectedNoteId: string | null;
}

const initialState: NotesState = {
  notes: [],
  pinnedNotes: [],
  selectedNoteId: null,
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    addNote: (
      state,
      action: PayloadAction<{ title: string; content: string; id: string }>
    ) => {
      const newNote: Note = {
        id: action.payload.id,
        title: action.payload.title,
        content: action.payload.content,
        date: new Date(),
        pinned: false,
      };
      state.notes.unshift(newNote);
    },
    updateNote: (
      state,
      action: PayloadAction<{ id: string; title?: string; content?: string }>
    ) => {
      const note = state.notes.find((n) => n.id === action.payload.id);
      if (note) {
        note.title = action.payload.title || note.title;
        note.content = action.payload.content || note.content;
        note.date = new Date();
      }
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter((n) => n.id !== action.payload);
      state.pinnedNotes = state.pinnedNotes.filter((n) => n !== action.payload);
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
  },
});

export const {
  addNote,
  updateNote,
  deleteNote,
  togglePinNote,
  setSelectedNoteId,
} = notesSlice.actions;
export default notesSlice.reducer;
