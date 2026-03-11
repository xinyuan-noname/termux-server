CREATE TABLE IF NOT EXISTS semesters (
    semester_name TEXT PRIMARY KEY,
    started_at TEXT NOT NULL,
    phase_list TEXT NOT NULL CHECK(json_valid(phase_list))
);