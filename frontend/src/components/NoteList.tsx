import React, { useEffect, useState } from 'react';
import { getAllNotes, updateNoteStatus } from '../services/noteService';
import { Note } from '../types/Note';
import './NoteList.css';

const NoteList: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

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

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing notes...');
      fetchNotes();
    }, 1000); // 1 second refresh

    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleToggleCompletion = async (note: Note) => {
    try {
      const newCompletedState = !note.completed;
      // If marking as completed, set status to "done"
      // If marking as incomplete, keep current status but don't set to "done"
      const currentStatus = note.status || 'not started';
      const updatedNote = {
        ...note,
        completed: newCompletedState,
        status: newCompletedState ? 'done' : currentStatus,
      };
      await updateNoteStatus(updatedNote, updatedNote.status || 'not started');
      // Re-fetch all notes to ensure UI is in sync
      const updatedNotes = await getAllNotes();
      if (Array.isArray(updatedNotes)) {
        setNotes(updatedNotes);
      }
    } catch (err) {
      console.error('Error toggling note completion:', err);
    }
  };

  const handleStatusChange = async (note: Note, newStatus: string) => {
    try {
      // Sync status and completed field:
      // - If status is "done", mark as completed
      // - If status is anything else, mark as not completed
      const updatedNote = {
        ...note,
        status: newStatus,
        completed: newStatus === 'done' ? true : false,
      };
      await updateNoteStatus(updatedNote, newStatus);
      // Re-fetch all notes to ensure UI is in sync
      const updatedNotes = await getAllNotes();
      if (Array.isArray(updatedNotes)) {
        setNotes(updatedNotes);
      }
    } catch (err) {
      console.error('Error updating note status:', err);
    }
  };

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  // Filter notes based on selected status filter
  const filteredNotes = statusFilter 
    ? notes.filter(note => note.status === statusFilter)
    : notes;

  const completedCount = filteredNotes.filter(n => n.completed).length;
  const incompleteCount = filteredNotes.length - completedCount;
  const totalCount = filteredNotes.length;

  return (
    <div className="checklist-container">
      <div className="checklist-header">
        <div className="header-top">
          <h2>All Notes</h2>
          <div className="item-count-badge">
            {totalCount} {totalCount === 1 ? 'item' : 'items'}
          </div>
        </div>
        
        <div className="status-filter">
          <label className="filter-label">Filter by Status:</label>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${statusFilter === null ? 'active' : ''}`}
              onClick={() => setStatusFilter(null)}
            >
              All
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'not started' ? 'active' : ''}`}
              onClick={() => setStatusFilter('not started')}
            >
              Not Started
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'in progress' ? 'active' : ''}`}
              onClick={() => setStatusFilter('in progress')}
            >
              In Progress
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'done' ? 'active' : ''}`}
              onClick={() => setStatusFilter('done')}
            >
              Done
            </button>
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
        {filteredNotes.map(note => (
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
                <div className="note-details">
                  <small className="note-date">Created: {formatDate(note.createdDate)}</small>
                  <select 
                    className={`status-dropdown status-${note.status || 'not started'}`}
                    value={note.status || 'not started'}
                    onChange={(e) => handleStatusChange(note, e.target.value)}
                    aria-label={`Status for "${note.text}"`}
                  >
                    <option value="not started">Not Started</option>
                    <option value="in progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
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

