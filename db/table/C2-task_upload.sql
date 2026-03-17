CREATE TABLE IF NOT EXISTS task_upload(
    task_id INTEGER NOT NULL,
    upload_id TEXT NOT NULL,
    upload_at INTEGER NOT NULL,
    upload_file_path TEXT,
    upload_file_name TEXT,
    upload_message TEXT,
    FOREIGN KEY (task_id) REFERENCES task_config(task_id) ON DELETE CASCADE,
    FOREIGN KEY (upload_id) REFERENCES auth(id) ON DELETE CASCADE
);