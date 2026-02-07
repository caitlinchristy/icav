package com.example.cis4900.spring.template.notes.models;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

public class NoteModelTest {

    @Test
    public void testDueDateGetterSetter() {
        Note n = new Note();
        LocalDate d = LocalDate.of(2026, 2, 7);
        n.setDueDate(d);
        assertEquals(d, n.getDueDate());
    }
}
