CREATE TABLE IF NOT EXISTS task_upload(
    task_id INTEGER NOT NULL,
    upload_id TEXT NOT NULL,
    upload_at INTEGER NOT NULL,
    upload_file_path TEXT,
    upload_message TEXT,
    PRIMARY KEY(task_id, upload_id),
    FOREIGN KEY (task_id) REFERENCES task_config(task_id) ON
DELETE CASCADE,
    FOREIGN KEY (upload_id) REFERENCES task_config(upload_id) ON
DELETE CASCADE
);