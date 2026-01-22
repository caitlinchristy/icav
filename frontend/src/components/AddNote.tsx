import React, { useState } from 'react';
import { addNote } from '../services/noteService';
import { Note } from '../types/Note';

interface AddNoteProps {
  onNoteAdded?: () => void;
}

const AddNote: React.FC<AddNoteProps> = ({ onNoteAdded }) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newNote: Omit<Note, 'id'> = { text };
      await addNote(newNote);
      setText('');
      // Call the callback to refresh the notes list
      if (onNoteAdded) {
        onNoteAdded();
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Text</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} disabled={isSubmitting} />
      </div>
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Note'}</button>
    </form>
  );
};

export default AddNote;
