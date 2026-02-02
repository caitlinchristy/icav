package com.example.cis4900.spring.template.notes;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.example.cis4900.spring.template.notes.dao.NotesDao;
import com.example.cis4900.spring.template.notes.models.Note;

public class NotesServiceImplTest {

    @Mock
    private NotesDao notesDao;

    @InjectMocks
    private NotesServiceImpl notesService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.initMocks(this);
    }

    @Test
    public void testAddNote() {
        Note newNote = new Note();
        when(notesDao.save(newNote)).thenReturn(newNote);

        Note result = notesService.addNote(newNote);  // FIXED: Note not String

        assertNotNull(result);  // FIXED: Check it's not null instead of "Saved"
        verify(notesDao, times(1)).save(newNote);
    }

    @Test
    public void testGetNote() {
        Note expectedNote = new Note();
        when(notesDao.findById(1)).thenReturn(Optional.of(expectedNote));

        Note result = notesService.getNote(1);

        assertNotNull(result);
        assertEquals(expectedNote, result);
        verify(notesDao, times(1)).findById(1);
    }

    @Test
    public void testUpdateNote() {
        Note updatedNote = new Note();
        when(notesDao.save(updatedNote)).thenReturn(updatedNote);

        String result = notesService.updateNote(updatedNote);

        assertEquals("Updated", result);
        verify(notesDao, times(1)).save(updatedNote);
    }

    @Test
    public void testDeleteNote() {
        Integer id = 1;

        String result = notesService.deleteNote(id);

        assertEquals("Deleted", result);
        verify(notesDao, times(1)).deleteById(id);
    }

    @Test
    public void testAllNotes() {
        List<Note> expectedNotes = new ArrayList<>();
        when(notesDao.findAll()).thenReturn(expectedNotes);

        Iterable<Note> result = notesService.allNotes();

        assertNotNull(result);
        assertEquals(expectedNotes, result);
        verify(notesDao, times(1)).findAll();
    }

    @Test
    public void testCount() {
        Integer expectedCount = 5;
        when(notesDao.getCount()).thenReturn(expectedCount);

        Integer result = notesService.count();

        assertNotNull(result);
        assertEquals(expectedCount, result);
        verify(notesDao, times(1)).getCount();
    }
}