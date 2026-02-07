import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock noteService
jest.mock('../../services/noteService', () => ({
  getAllNotes: jest.fn(),
  updateNote: jest.fn(),
  updateNoteStatus: jest.fn(),
}));

import { getAllNotes } from '../../services/noteService';
import NoteList from '../NoteList';

describe('NoteList due date display and sorting', () => {
  const sampleNotes = [
    { id: 1, text: 'A', createdDate: '2026-02-01T00:00:00Z', dueDate: '2026-02-10', completed: false, status: 'not started' },
    { id: 2, text: 'B', createdDate: '2026-02-02T00:00:00Z', dueDate: '2026-02-05', completed: false, status: 'not started' },
    { id: 3, text: 'C', createdDate: '2026-02-03T00:00:00Z', dueDate: undefined, completed: false, status: 'not started' },
  ];

  beforeEach(() => {
    (getAllNotes as jest.Mock).mockResolvedValue(sampleNotes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders due date inputs with correct values', async () => {
    render(<NoteList />);
    // Wait for notes to be loaded
    await waitFor(() => expect(getAllNotes).toHaveBeenCalled());

    // There should be date inputs for each note
    const inputs = screen.getAllByLabelText(/Due date for/i);
    expect(inputs.length).toBe(3);

    // Check values for notes with due dates
    expect((inputs[0] as HTMLInputElement).value).toBe('2026-02-10');
    expect((inputs[1] as HTMLInputElement).value).toBe('2026-02-05');
    // third has no due date
    expect((inputs[2] as HTMLInputElement).value).toBe('');
  });

  test('sorts by due date ascending by default and toggles order', async () => {
    render(<NoteList />);
    await waitFor(() => expect(getAllNotes).toHaveBeenCalled());

    // By default sortBy is dueDate asc; the order of note texts should be B (02-05), A (02-10), C (no date goes last)
    const textNodes = screen.getAllByText(/^[ABC]$/i);
    const texts = textNodes.map(n => n.textContent);
    expect(texts).toEqual(['B', 'A', 'C']);

    // Click Due Date button to toggle to desc
    const dueButton = screen.getByRole('button', { name: /Due Date/i });
    fireEvent.click(dueButton); // toggles to desc

    // After toggle, expect A, B, C (latest first)
    const textNodes2 = screen.getAllByText(/^[ABC]$/i);
    const texts2 = textNodes2.map(n => n.textContent);
    expect(texts2).toEqual(['A', 'B', 'C']);
  });
});
