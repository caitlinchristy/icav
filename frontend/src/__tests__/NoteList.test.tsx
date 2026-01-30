import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import NoteList from '../components/NoteList';
import * as noteService from '../services/noteService';
import { Note } from '../types/Note';

jest.mock('../services/noteService');

const mockNotes: Note[] = [
  { id: 1, text: 'task 1', completed: false, status: 'not started', createdDate: '2026-01-29T12:00:00Z' },
  { id: 2, text: 'task 2', completed: true, status: 'done', createdDate: '2026-01-28T12:00:00Z' },
];

describe('NoteList component', () => {
  beforeEach(() => {
    (noteService.getAllNotes as jest.Mock).mockResolvedValue(mockNotes);
    (noteService.updateNoteStatus as jest.Mock).mockResolvedValue({});
  });

  it('displays notes after successful fetch', async () => {
    render(<NoteList />);
    await waitFor(() => {
      expect(screen.getByText('task 1')).toBeInTheDocument();
      expect(screen.getByText('task 2')).toBeInTheDocument();
    });
  });

  it('updates note status and refetches notes', async () => {
    render(<NoteList />);
    await waitFor(() => screen.getByText('task 1'));

    const select = screen.getAllByRole('combobox')[0];
    fireEvent.change(select, { target: { value: 'done' } });

    // ensure updateNoteStatus is called with correct args
    expect(noteService.updateNoteStatus).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, status: 'done' }),
      'done',
    );

    // getAllNotes should be called again
    await waitFor(() => {
      expect(noteService.getAllNotes).toHaveBeenCalledTimes(2);
    });
  });

  it('filters notes by status', async () => {
    render(<NoteList />);
    await waitFor(() => screen.getByText('task 1'));

    const filterButton = screen.getByRole('button', { name: 'Done' });
    fireEvent.click(filterButton);

    // only 'done' task should appear
    expect(screen.queryByText('task 1')).not.toBeInTheDocument();
    expect(screen.getByText('task 2')).toBeInTheDocument();
  });
});
