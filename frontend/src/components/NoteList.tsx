import React, { useEffect, useState } from 'react';
import { getAllNotes } from '../services/noteService';
import { Note } from '../types/Note';

const NoteList: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const notes = await getAllNotes();
        console.log('Fetched notes:', notes); // Log the fetched notes
        if (Array.isArray(notes)) {
          setNotes(notes);
        } else {
          setError('Failed to fetch notes');
        }
      } catch (err) {
        console.error('Error fetching notes:', err);
        setError('Failed to fetch notes');
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>All Notes</h2>
      <ul>
        {notes.map(note => (
          <li key={note.id}>
            <p>{note.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoteList;
