import React, { useState } from 'react';
import { addNote } from '../services/noteService';
import { Note } from '../types/Note';

interface AddNoteProps {
  onNoteAdded?: () => void;
}

const AddNote: React.FC<AddNoteProps> = ({ onNoteAdded }) => {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate that text is not empty
    if (!text.trim()) {
      setError('Please enter a note before submitting');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const newNote: Omit<Note, 'id'> = { 
        text: text.trim(),
        dueDate: dueDate || undefined,
      };
      await addNote(newNote);
      setText('');
      setDueDate('');
      // Call the callback to refresh the notes list
      if (onNoteAdded) {
        onNoteAdded();
      }
    } catch (error) {
      console.error('Error adding note:', error);
      setError('Failed to add note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Text</label>
        <textarea 
          value={text} 
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }} 
          disabled={isSubmitting}
          placeholder="Enter your note here..."
        />
      </div>
      <div>
        <label>Due Date</label>
        <input 
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      {error && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{error}</p>}
      <button type="submit" disabled={isSubmitting || !text.trim()}>{isSubmitting ? 'Adding...' : 'Add Note'}</button>
    </form>
  );
};

export default AddNote;
