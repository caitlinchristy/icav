import React, { useEffect, useState } from 'react';
import { getAllNotes, updateNoteStatus, updateNote } from '../services/noteService';
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

  const [editingDueDates, setEditingDueDates] = useState<Record<number, string>>({});
  const [savingDue, setSavingDue] = useState<Record<number, boolean>>({});
  const [editingTextMode, setEditingTextMode] = useState<Record<number, boolean>>({});
  const [editingDueMode, setEditingDueMode] = useState<Record<number, boolean>>({});
  const [editingTexts, setEditingTexts] = useState<Record<number, string>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      // Skip auto-refresh while any note is being edited to avoid closing editors
      const anyEditing = Object.values(editingTextMode).some(Boolean) || Object.values(editingDueMode).some(Boolean);
      if (anyEditing) return;
      fetchNotes();
    }, 10000); // 10 second refresh

    return () => clearInterval(interval);
  }, [editingTextMode, editingDueMode]);

  

  useEffect(() => {
    const map: Record<number, string> = {};
    const tmap: Record<number, string> = {};
    const etmap: Record<number, boolean> = {};
    const edmap: Record<number, boolean> = {};
    notes.forEach(n => {
      if (n.id !== undefined && n.id !== null) {
        map[n.id] = n.dueDate || '';
        tmap[n.id] = n.text || '';
        etmap[n.id] = false;
        edmap[n.id] = false;
      }
    });
    setEditingDueDates(map);
    setEditingTexts(tmap);
    setEditingTextMode(etmap);
    setEditingDueMode(edmap);
  }, [notes]);
  // Auto-complete past due notes (only once after fetch)
  useEffect(() => {
    const markPastDue = async () => {
      const today = new Date();
      today.setHours(0,0,0,0);
      for (const n of notes) {
        if (!n) continue;
        if (n.dueDate && !n.completed) {
          const d = parseDateOnly(n.dueDate);
          if (d < today) {
            try {
              const updated = { ...n, completed: true, status: 'done' };
              await updateNote(updated);
            } catch (err) {
              console.error('Failed to auto-complete past-due note', err);
            }
          }
        }
      }
      // re-fetch to reflect changes
      fetchNotes();
    };
    if (notes.length > 0) markPastDue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes.length]);

  const handleDueDateChange = (id: number, value: string) => {
    setEditingDueDates(prev => ({ ...prev, [id]: value }));
  };

  const handleTextChange = (id: number, value: string) => {
    setEditingTexts(prev => ({ ...prev, [id]: value }));
  };

  // Helpers to parse and format date-only strings (YYYY-MM-DD) without timezone shifts
  const parseDateOnly = (dateOnly?: string): Date => {
    if (!dateOnly) return new Date('');
    const parts = dateOnly.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return new Date(y, m, d);
  };

  const formatDueDate = (dateOnly?: string): string => {
    if (!dateOnly) return 'No date';
    const date = parseDateOnly(dateOnly);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSaveEdit = async (note: Note) => {
    // Combined save: if user edited both text and due date, save both
    const newDate = editingDueDates[note.id] || '';
    const newText = editingTexts[note.id] ?? note.text;
    // If nothing changed, just close editors
    if ((note.dueDate || '') === newDate && (note.text || '') === newText) {
      setEditingTextMode(prev => ({ ...prev, [note.id]: false }));
      setEditingDueMode(prev => ({ ...prev, [note.id]: false }));
      return;
    }
    setSavingDue(prev => ({ ...prev, [note.id]: true }));
    try {
      const updatedNote: Note = { ...note, dueDate: newDate || undefined, text: newText };
      await updateNote(updatedNote);
      const updatedNotes = await getAllNotes();
      if (Array.isArray(updatedNotes)) setNotes(updatedNotes);
      setEditingTextMode(prev => ({ ...prev, [note.id]: false }));
      setEditingDueMode(prev => ({ ...prev, [note.id]: false }));
    } catch (err) {
      console.error('Error saving edits:', err);
    } finally {
      setSavingDue(prev => ({ ...prev, [note.id]: false }));
    }
  };

  const cancelTextEdit = (note: Note) => {
    setEditingTexts(prev => ({ ...prev, [note.id]: note.text || '' }));
    setEditingTextMode(prev => ({ ...prev, [note.id]: false }));
  };

  const cancelDueEdit = (note: Note) => {
    setEditingDueDates(prev => ({ ...prev, [note.id]: note.dueDate || '' }));
    setEditingDueMode(prev => ({ ...prev, [note.id]: false }));
  };

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
                  <small className="note-date">{note.modifiedDate ? `Modified: ${formatDate(note.modifiedDate)}` : `Created: ${formatDate(note.createdDate)}`}</small>
                  <div className="due-section">
                    <label className="due-label">Due Date</label>
                    {editingTextMode[note.id] ? (
                      <>
                        <input
                          id={`text-${note.id}`}
                          type="text"
                          className="note-text-input"
                          value={editingTexts[note.id] || ''}
                          onChange={(e) => handleTextChange(note.id, e.target.value)}
                          aria-label={`Edit text for ${note.text}`}
                        />
                        <button className="save-btn" onClick={() => handleSaveEdit(note)}>Save</button>
                        <button className="cancel-btn" onClick={() => cancelTextEdit(note)}>Cancel</button>
                      </>
                    ) : editingDueMode[note.id] ? (
                      <>
                        <input
                          id={`due-${note.id}`}
                          type="date"
                          className="note-due-input"
                          value={editingDueDates[note.id] || ''}
                          onChange={(e) => handleDueDateChange(note.id, e.target.value)}
                          aria-label={`Due date for ${note.text}`}
                        />
                        <button className="save-btn" onClick={() => handleSaveEdit(note)}>Save</button>
                        <button className="cancel-btn" onClick={() => cancelDueEdit(note)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <input
                          id={`due-${note.id}`}
                          type="date"
                          className="note-due-input"
                          value={editingDueDates[note.id] || note.dueDate || ''}
                          onChange={(e) => handleDueDateChange(note.id, e.target.value)}
                          aria-label={`Due date for ${note.text}`}
                          disabled
                        />
                        <button className="edit-due-btn" onClick={() => setEditingTextMode(prev => ({ ...prev, [note.id]: true }))}>
                          Edit Text
                        </button>
                        <button className="edit-due-btn" onClick={() => setEditingDueMode(prev => ({ ...prev, [note.id]: true }))}>
                          {note.dueDate ? 'Edit date' : 'Add date'}
                        </button>
                      </>
                    )}
                    {savingDue[note.id] && <small className="saving-indicator">Saving...</small>}
                  </div>
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

