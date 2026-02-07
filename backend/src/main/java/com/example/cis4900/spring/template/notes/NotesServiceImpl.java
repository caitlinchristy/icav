package com.example.cis4900.spring.template.notes;

import org.springframework.beans.factory.annotation.Autowired;
import java.time.Instant;
import java.time.LocalDate;
import org.springframework.stereotype.Service;

import com.example.cis4900.spring.template.notes.dao.NotesDao;
import com.example.cis4900.spring.template.notes.models.Note;

@Service
public class NotesServiceImpl implements NotesService {
    @Autowired
    private NotesDao notesDao;

    @Override
    public Note addNote(Note newNote) {
        try {
            return notesDao.save(newNote);
        } catch (Exception exception) {
            throw new RuntimeException(exception.getMessage());
        }
    }

    @Override
    public Note getNote(Integer id) {
        return notesDao.findById(id).get();
    }

    @Override
    public String updateNote(Note updatedNote) {
        try {
            updatedNote.setModifiedDate(Instant.now());
            notesDao.save(updatedNote);
        } catch (Exception exception) {
            return exception.getMessage();
        }
        return "Updated";
    }

    @Override
    public String deleteNote(Integer id) {
        try {
            notesDao.deleteById(id);
        } catch (Exception exception) {
            return exception.getMessage();
        }
        return "Deleted";
    }

    @Override
    public Iterable<Note> allNotes() {
        Iterable<Note> notes = notesDao.findAll();
        LocalDate today = LocalDate.now();
        for (Note n : notes) {
            try {
                if (n.getDueDate() != null && n.getDueDate().isBefore(today) && (n.getCompleted() == null || !n.getCompleted())) {
                    n.setCompleted(true);
                    n.setStatus("done");
                    n.setModifiedDate(Instant.now());
                    notesDao.save(n);
                }
            } catch (Exception e) {
                // ignore per-note update failures so retrieval still succeeds
            }
        }
        return notes;
    }

    @Override
    public Integer count() {
        return notesDao.getCount();
    }
}