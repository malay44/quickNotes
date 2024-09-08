import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export interface Note {
  id: string;
  title: string;
  content: string;
  summary: string;
  date: string;
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
    },
    updateNote: (
      state,
      action: PayloadAction<{
        id: string;
        title?: string;
        content?: string;
        summary?: string;
      }>
    ) => {
      const { id, title, content, summary } = action.payload;
      const noteIndex = state.notes.findIndex((note) => note.id === id);
      if (noteIndex !== -1) {
        state.notes[noteIndex] = {
          ...state.notes[noteIndex],
          title: title ?? state.notes[noteIndex].title,
          content: content ?? state.notes[noteIndex].content,
          summary: summary ?? state.notes[noteIndex].summary,
          date: new Date().toISOString(), // Store date as ISO string
        };
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
