CREATE TABLE IF NOT EXISTS schedule(
    semester TEXT NOT NULL,
    week INTEGER NOT NULL,
    weekday INTEGER NOT NULL,
    period_start INTEGER NOT NULL,
    location TEXT,
    is_experiment INTEGER DEFAULT 0 CHECK (is_experiment IN (0, 1)),
    alias TEXT,
    homework TEXT,
    summary TEXT,
    issue TEXT,
    PRIMARY KEY (semester, week, weekday, period_start),
    FOREIGN KEY (semester) REFERENCES semesters(semester_name) ON
DELETE CASCADE
);