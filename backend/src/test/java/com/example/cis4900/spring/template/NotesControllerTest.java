package com.example.cis4900.spring.template.controllers;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import com.example.cis4900.spring.template.notes.NotesService;
import com.example.cis4900.spring.template.notes.models.Note;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@WebMvcTest(NotesController.class)
public class NotesControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private NotesService notesService;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private Note testNote1;
    private Note testNote2;
    
    @BeforeEach
    public void setUp() {
        testNote1 = new Note(1, "Test Content 1");
        testNote2 = new Note(2, "Test Content 2");
    }
    
    @Test
    public void testGetAllNotes_ReturnsNotesList() throws Exception {
        // Arrange: Mock service behavior
        List<Note> notes = Arrays.asList(testNote1, testNote2);
        when(notesService.allNotes()).thenReturn(notes);
        
        // Act & Assert
        mockMvc.perform(get("/api/notes/all")
                .accept(MediaType.APPLICATION_JSON))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$", hasSize(2)))
               .andExpect(jsonPath("$[0].id", is(1)))
               .andExpect(jsonPath("$[0].text", is("Test Content 1")))
               .andExpect(jsonPath("$[1].id", is(2)));
        
        // Verify mock was called
        verify(notesService, times(1)).allNotes();
    }
    
    @Test
    public void testGetAllNotes_ReturnsEmptyList() throws Exception {
        // Arrange
        when(notesService.allNotes()).thenReturn(Arrays.asList());
        
        // Act & Assert
        mockMvc.perform(get("/api/notes/all"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$", hasSize(0)));
        
        verify(notesService).allNotes();
    }
    
    @Test
    public void testGetNoteById_ReturnsNote() throws Exception {
        // Arrange
        Integer noteId = 1;
        when(notesService.getNote(noteId)).thenReturn(testNote1);
        
        // Act & Assert
        mockMvc.perform(get("/api/notes/get/{id}", noteId))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id", is(1)))
               .andExpect(jsonPath("$.text", is("Test Content 1")));
        
        verify(notesService).getNote(noteId);
    }
    
    @Test
    public void testGetNoteById_NotFound() throws Exception {
        // Arrange
        Integer noteId = 999;
        when(notesService.getNote(noteId)).thenReturn(null);
        
        // Act & Assert
        mockMvc.perform(get("/api/notes/get/{id}", noteId))
               .andExpect(status().isOk()) // Returns 200 with null body
               .andExpect(content().string(""));
        
        verify(notesService).getNote(noteId);
    }
    
    @Test
    public void testDateEndpoint_ReturnsFormattedDate() throws Exception {
        // Act & Assert - This endpoint doesn't use NotesService!
        mockMvc.perform(get("/api/notes/date"))
               .andExpect(status().isOk())
               .andExpect(content().string(containsString(","))); // Should have comma in date format
    }
    
    @Test
    public void testCountEndpoint() throws Exception {
        // Arrange
        when(notesService.count()).thenReturn(5);
        
        // Act & Assert
        mockMvc.perform(get("/api/notes/count"))
               .andExpect(status().isOk())
               .andExpect(content().string("5"));
        
        verify(notesService).count();
    }
}
