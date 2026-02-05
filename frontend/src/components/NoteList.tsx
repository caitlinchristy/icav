import React, { useEffect, useState } from 'react';
import { getAllNotes, updateNoteStatus } from '../services/noteService';
import { Note } from '../types/Note';
import './NoteList.css';

const NoteList: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'dueDate' | 'createdDate'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  // Sort notes by due date or created date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    let aValue: Date | null = null;
    let bValue: Date | null = null;

    if (sortBy === 'dueDate') {
      aValue = a.dueDate ? new Date(a.dueDate) : null;
      bValue = b.dueDate ? new Date(b.dueDate) : null;
      // Tasks without due dates go to bottom for ascending, top for descending
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return sortOrder === 'asc' ? 1 : -1;
      if (bValue === null) return sortOrder === 'asc' ? -1 : 1;
    } else {
      aValue = a.createdDate ? new Date(a.createdDate) : null;
      bValue = b.createdDate ? new Date(b.createdDate) : null;
      if (aValue === null || bValue === null) return 0;
    }

    const comparison = aValue!.getTime() - bValue!.getTime();
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const completedCount = filteredNotes.filter(n => n.completed).length;
  const incompleteCount = filteredNotes.length - completedCount;
  const totalCount = filteredNotes.length;

  const handleToggleDueDateSort = () => {
    if (sortBy === 'dueDate') {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy('dueDate');
      setSortOrder('asc');
    }
  };

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

        <div className="sort-control">
          <label className="sort-label">Sort by:</label>
          <button 
            className={`sort-btn ${sortBy === 'dueDate' ? 'active' : ''}`}
            onClick={handleToggleDueDateSort}
            title={`Sort by Due Date (${sortOrder === 'asc' ? 'Earliest first' : 'Latest first'})`}
          >
            Due Date {sortBy === 'dueDate' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            className={`sort-btn ${sortBy === 'createdDate' ? 'active' : ''}`}
            onClick={() => setSortBy('createdDate')}
            title="Sort by Created Date"
          >
            Created Date
          </button>
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
        {sortedNotes.map(note => (
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
                  {note.dueDate && (
                    <small className="note-due-date">Due: {new Date(note.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</small>
                  )}
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

