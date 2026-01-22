import React from 'react';
import AddNote from './components/AddNote';
import NoteList from './components/NoteList';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>TODO Notes Application</h1>
      <AddNote />
      <NoteList />
    </div>
  );
};


// const App: React.FC = () => {
//   return (
//     <div className="App">
//       <h1>TODO Notes Application</h1>
//     </div>
//   );
// };

export default App;