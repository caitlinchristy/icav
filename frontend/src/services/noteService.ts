import { Note } from '../types/Note';

//const API_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:8080/api/notes' : '/api/notes';
const API_URL = '/api/notes';
console.log('API_URL:', API_URL);  // Log the API URL

export const getAllNotes = async (): Promise<Note[]> => {
  console.log('Fetching all notes from:', `/api/notes/all`);  // Log the full endpoint
  try {
    const response = await fetch(`/api/notes/all`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log('API response:', data); // Log the response data
    return data;
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
};

export const getNote = async (id: number): Promise<Note> => {
  console.log(`Fetching note with id ${id} from:`, `${API_URL}/get/${id}`);  // Log the full endpoint
  try {
    const response = await fetch(`${API_URL}/get/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching note:', error);
    throw error;
  }
};

export const addNote = async (note: Omit<Note, 'id'>): Promise<Note> => {
  console.log('Adding note to:', `${API_URL}/add`, note);  // Log the full endpoint and note data
  try {
    const response = await fetch(`${API_URL}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(note),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
};

export const updateNote = async (note: Note): Promise<Note> => {
  console.log('Updating note at:', `${API_URL}/update`, note);  // Log the full endpoint and note data
  try {
    const response = await fetch(`${API_URL}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(note),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

// import { Note } from '../types/Note';

// const testNotes: Note[] = [
//   { id: 1, text: 'Test Note 1' },
//   { id: 2, text: 'Test Note 2' },
//   { id: 3, text: 'Test Note 3' },
// ];

// export const getAllNotes = async (): Promise<Note[]> => {
//   console.log('Returning all test notes');
//   return Promise.resolve(testNotes);
// };

// export const getNote = async (id: number): Promise<Note> => {
//   console.log(`Returning test note with id ${id}`);
//   const note = testNotes.find(note => note.id === id);
//   if (!note) {
//     throw new Error(`Note with id ${id} not found`);
//   }
//   return Promise.resolve(note);
// };

// export const addNote = async (note: Omit<Note, 'id'>): Promise<Note> => {
//   console.log('Adding test note', note);
//   const newNote: Note = { id: testNotes.length + 1, ...note };
//   testNotes.push(newNote);
//   return Promise.resolve(newNote);
// };

// export const updateNote = async (note: Note): Promise<Note> => {
//   console.log('Updating test note', note);
//   const index = testNotes.findIndex(n => n.id === note.id);
//   if (index === -1) {
//     throw new Error(`Note with id ${note.id} not found`);
//   }
//   testNotes[index] = note;
//   return Promise.resolve(note);
// };

