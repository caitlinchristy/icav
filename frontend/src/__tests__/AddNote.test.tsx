import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddNote from '../components/AddNote';
import * as noteService from '../services/noteService';

// mock getDate function
jest.mock('../services/noteService');

describe('AddNote behavior', () => {
    const addNoteMock = noteService.addNote as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => { }); // silence console errors
    });

    test('calls addNote and onNoteAdded on successful submission', async () => {
        addNoteMock.mockResolvedValue({});
        const onNoteAdded = jest.fn();

        render(<AddNote onNoteAdded={onNoteAdded} />);
        fireEvent.change(screen.getByPlaceholderText(/enter your note/i), { target: { value: 'Test note' } });
        fireEvent.click(screen.getByRole('button', { name: /add note/i }));

        await waitFor(() => expect(addNoteMock).toHaveBeenCalledWith({ text: 'Test note' }));
        expect(onNoteAdded).toHaveBeenCalled();
    });

    test('shows error if addNote API call fails', async () => {
        addNoteMock.mockRejectedValue(new Error('API error'));

        render(<AddNote />);
        fireEvent.change(screen.getByPlaceholderText(/enter your note/i), { target: { value: 'Fail note' } });
        fireEvent.click(screen.getByRole('button', { name: /add note/i }));

        expect(await screen.findByText(/failed to add note/i)).toBeInTheDocument();
    });

});
