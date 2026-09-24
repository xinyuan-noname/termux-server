CREATE TABLE IF NOT EXISTS task_draw(
    task_id INTEGER PRIMARY KEY,
    reproducible INTEGER DEFAULT 0 CHECK (reproducible IN (0, 1)),
    range_user_list TEXT CHECK(
        json_type(json(range_user_list)) = 'array'
        OR range_user_list IS NULL
    ),
    FOREIGN KEY (task_id) REFERENCES task_config(task_id) ON DELETE CASCADE
);
