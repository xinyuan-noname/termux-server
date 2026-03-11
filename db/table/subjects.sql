CREATE TABLE IF NOT EXISTS subjects (
    subject_name TEXT PRIMARY KEY,
    alias TEXT,
    teachers TEXT CHECK(json_valid(teachers)),
    courses TEXT CHECK(json_valid(courses)),
    semester TEXT NOT NULL,
    FOREIGN KEY (semester) REFERENCES semesters(semester_name) ON
DELETE CASCADE
);