CREATE TABLE IF NOT EXISTS task_config(
    task_id INTEGER PRIMARY KEY,
    title TEXT,
    started_at INTEGER NOT NULL,
    ended_at INTEGER NOT NULL CHECK (ended_at >= started_at),
    subject_name TEXT,
    mimetype TEXT,
    task_type TEXT,
    format TEXT,
    source TEXT,
    is_notice INTEGER DEFAULT 0 CHECK (is_notice IN (0, 1)),
    description TEXT,
    draw_result TEXT CHECK(
        json_type(json(draw_result)) = 'array'
        OR draw_result is NULL
    )
);
