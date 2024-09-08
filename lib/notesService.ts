export interface Note {
  id: number;
  title: string;
  content: string;
  date: Date;
  pinned: boolean;
}

let notes: Note[] = [];
let nextId = 1;

export const getNotes = () => notes;

export const addNote = (title: string, content: string) => {
  const newNote: Note = {
    id: nextId++,
    title,
    content,
    date: new Date(),
    pinned: false,
  };
  notes.unshift(newNote);
  return newNote;
};

export const updateNote = (id: number, title: string, content: string) => {
  const note = notes.find((n) => n.id === id);
  if (note) {
    note.title = title;
    note.content = content;
    note.date = new Date();
  }
  return note;
};

export const deleteNote = (id: number) => {
  notes = notes.filter((n) => n.id !== id);
};

export const togglePinNote = (id: number) => {
  const note = notes.find((n) => n.id === id);
  if (note) {
    note.pinned = !note.pinned;
    notes.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }
  return note;
};
