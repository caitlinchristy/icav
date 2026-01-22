import React, { useState, useCallback } from 'react';
import AddNote from './components/AddNote';
import NoteList from './components/NoteList';
import { getAllNotes } from './services/noteService';

const App: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNoteAdded = useCallback(() => {
    // Trigger a refresh of the notes list
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <div className="App">
      <h1>TODO Notes Application</h1>
      <AddNote onNoteAdded={handleNoteAdded} />
      <NoteList key={refreshTrigger} />
    </div>
  );
};

export default App;