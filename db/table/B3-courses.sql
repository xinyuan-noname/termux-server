CREATE TABLE IF NOT EXISTS courses(
    subject_name TEXT NOT NULL,
    weeks TEXT CHECK(json_type(json(weeks)) = 'array'),
    weekday INTEGER NOT NULL,
    location TEXT,
    biweekly INTEGER DEFAULT 0 CHECK(biweekly IN (0,1)),
    period TEXT CHECK(json_type(json(period)) = 'array'),
    FOREIGN KEY (subject_name) REFERENCES subjects(subject_name) ON
DELETE CASCADE
);