CREATE TABLE IF NOT EXISTS subjects (
    subject_name TEXT PRIMARY KEY,
    credit REAL,
    course_type TEXT,
    alias TEXT,
    teachers TEXT CHECK(json_type(json(teachers)) = 'array'),
    semester TEXT NOT NULL,
    FOREIGN KEY (semester) REFERENCES semesters(semester_name) ON
DELETE CASCADE
);