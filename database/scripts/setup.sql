use template_db;

create table if not exists note
(
    id int auto_increment comment 'Primary Key'
        primary key,
    text varchar(255) null,
    created_date datetime null default current_timestamp comment 'When the note was created',
    completed boolean null default false comment 'Whether the note is completed'
);
