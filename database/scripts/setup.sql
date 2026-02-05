use template_db;

create table if not exists note
(
    id int auto_increment comment 'Primary Key'
        primary key,
    text varchar(255) null,
    created_date datetime null default current_timestamp comment 'When the note was created',
    completed boolean null default false comment 'Whether the note is completed',
    status varchar(20) null default 'not started' comment 'Task status: not started, in progress, or done',
    due_date date null comment 'Due date for the task in YYYY-MM-DD format'
);
