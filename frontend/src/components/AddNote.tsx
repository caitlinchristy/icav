import React, { useState } from 'react';
import { addNote } from '../services/noteService';
import { Note } from '../types/Note';

const AddNote: React.FC = () => {
  const [text, setText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: Omit<Note, 'id'> = { text };
    await addNote(newNote);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Text</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <button type="submit">Add Note</button>
    </form>
  );
};

export default AddNote;
