CREATE TABLE IF NOT EXISTS task_vote(
    task_id INTEGER PRIMARY KEY,
    voters TEXT CHECK(
        json_type(json(voters)) = 'array'
        OR voters IS NULL
    ),
    multiple INTEGER DEFAULT 0 CHECK (multiple IN (0, 1)),
    max_choices INTEGER CHECK (max_choices IS NULL OR max_choices > 0),
    anonymous INTEGER DEFAULT 0 CHECK (anonymous IN (0, 1)),
    FOREIGN KEY (task_id) REFERENCES task_config(task_id) ON DELETE CASCADE
);
