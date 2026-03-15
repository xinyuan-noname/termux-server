CREATE TABLE IF NOT EXISTS task_config(
    task_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    started_at INTEGER NOT NULL,
    ended_at INTEGER NOT NULL,
    subject_name TEXT,
    mimetype TEXT,
    task_type TEXT,
    FOREIGN KEY (subject_name) REFERENCES subjects(subject_name) ON
DELETE CASCADE
);