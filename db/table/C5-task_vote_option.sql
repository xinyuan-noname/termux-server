CREATE TABLE IF NOT EXISTS task_vote_option(
    option_id INTEGER PRIMARY KEY,
    task_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (task_id) REFERENCES task_config(task_id) ON DELETE CASCADE
);
