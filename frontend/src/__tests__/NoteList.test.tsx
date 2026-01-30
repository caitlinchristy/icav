import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import NoteList from '../components/NoteList';
import * as noteService from '../services/noteService';
import { Note } from '../types/Note';

jest.mock('../services/noteService');

const mockNotes: Note[] = [
  { id: 1, text: 'task 1', completed: false, createdDate: '2026-01-29T12:00:00Z' },
  { id: 2, text: 'task 2', completed: true, createdDate: '2026-01-28T12:00:00Z' },
];

describe('NoteList component', () => {
  beforeEach(() => {
    (noteService.getAllNotes as jest.Mock).mockResolvedValue(mockNotes);
    (noteService.toggleNoteCompletion as jest.Mock).mockResolvedValue({});
  });

  it('displays notes after successful fetch', async () => {
    const { container } = render(<NoteList />);

    // wait for notes to appear
    await waitFor(() => {
      expect(screen.getByText('task 1')).toBeInTheDocument();
      expect(screen.getByText('task 2')).toBeInTheDocument();
    });

    // completed and remaining counts
    const completedCount = container.querySelector('.count-stats .stat:nth-child(1) .stat-value');
    expect(completedCount).toHaveTextContent('1');

    const remainingCount = container.querySelector('.count-stats .stat:nth-child(2) .stat-value');
    expect(remainingCount).toHaveTextContent('1');

    // progress bar
    const progressFill = container.querySelector('.progress-fill');
    expect(progressFill).toHaveStyle('width: 50%');

    // checkboxes reflect completion state
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes[0].checked).toBe(false);
    expect(checkboxes[1].checked).toBe(true);
  });
});
