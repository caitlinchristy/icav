import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DateDisplay from '../components/DateDisplay';
import * as noteService from '../services/noteService';

// mock getDate function
jest.mock('../services/noteService');

describe('DateDisplay component', () => {
    const getDateMock = noteService.getDate as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => { }); // silence console errors
    });

    test('shows loading initially', () => {
        render(<DateDisplay />);
        expect(screen.getByText(/loading date/i)).toBeInTheDocument();
    });

    test('displays the date when fetch is successful', async () => {
        getDateMock.mockResolvedValue('2026-01-29');

        render(<DateDisplay />);

        // Wait for date to appear
        const dateElement = await screen.findByText('2026-01-29');
        expect(dateElement).toBeInTheDocument();
        expect(screen.queryByText(/loading date/i)).not.toBeInTheDocument();
    });

    test('displays error message when fetch fails', async () => {
        getDateMock.mockRejectedValue(new Error('API error'));

        render(<DateDisplay />);

        const errorElement = await screen.findByText(/unable to load date/i);
        expect(errorElement).toBeInTheDocument();
        expect(screen.queryByText(/loading date/i)).not.toBeInTheDocument();
    });
});
