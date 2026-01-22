import React, { useEffect, useState } from 'react';
import { getAllNotes, toggleNoteCompletion } from '../services/noteService';
import { Note } from '../types/Note';
import './NoteList.css';

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

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleToggleCompletion = async (note: Note) => {
    try {
      await toggleNoteCompletion(note);
      // Re-fetch all notes to ensure UI is in sync
      const updatedNotes = await getAllNotes();
      if (Array.isArray(updatedNotes)) {
        setNotes(updatedNotes);
      }
    } catch (err) {
      console.error('Error toggling note completion:', err);
    }
  };

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  const completedCount = notes.filter(n => n.completed).length;
  const incompleteCount = notes.length - completedCount;
  const totalCount = notes.length;

  return (
    <div className="checklist-container">
      <div className="checklist-header">
        <div className="header-top">
          <h2>All Notes</h2>
          <div className="item-count-badge">
            {totalCount} {totalCount === 1 ? 'item' : 'items'}
          </div>
        </div>
        <div className="progress-info">
          <div className="count-stats">
            <div className="stat">
              <span className="stat-label">Completed:</span>
              <span className="stat-value">{completedCount}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Remaining:</span>
              <span className="stat-value">{incompleteCount}</span>
            </div>
          </div>
          {totalCount > 0 && (
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
      
      <ul className="checklist">
        {notes.map(note => (
          <li key={note.id} className={`checklist-item ${note.completed ? 'completed' : ''}`}>
            <div className="checklist-item-content">
              <input
                type="checkbox"
                className="checklist-checkbox"
                checked={note.completed || false}
                onChange={() => handleToggleCompletion(note)}
                aria-label={`Mark "${note.text}" as ${note.completed ? 'incomplete' : 'complete'}`}
              />
              <div className="checklist-item-text">
                <p className="note-text">{note.text}</p>
                <small className="note-date">Created: {formatDate(note.createdDate)}</small>
              </div>
            </div>
          </li>
        ))}
      </ul>
      
      {totalCount === 0 && (
        <div className="empty-state">
          <p>No notes yet. Add one to get started!</p>
        </div>
      )}
    </div>
  );
};

export default NoteList;
