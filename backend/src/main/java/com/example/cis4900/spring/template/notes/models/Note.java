package com.example.cis4900.spring.template.notes.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.Instant;

@Entity // This tells Hibernate to make a table out of this class
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String text;
    
    private Instant createdDate;
    
    private Boolean completed = false;
    
    private String status = "not started"; // not started, in progress, done

    public Note() {
        this.createdDate = Instant.now();
        this.completed = false;
        this.status = "not started";
    }

    public Note(Integer id, String text) {
        this.id = id;
        this.text = text;
        this.createdDate = Instant.now();
        this.completed = false;
        this.status = "not started";
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
    
    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }
    
    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }
    
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        if (status != null && (status.equals("not started") || status.equals("in progress") || status.equals("done"))) {
            this.status = status;
        }
    }
}