package com.example.cis4900.spring.template.notes;

import org.springframework.beans.factory.annotation.Autowired;
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
        return notesDao.findAll();
    }

    @Override
    public Integer count() {
        return notesDao.getCount();
    }
}