CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    gender TEXT CHECK (gender IS NULL OR gender IN ('male', 'female')),
    avatar_name TEXT,
    position TEXT,
    major TEXT,
    class TEXT,
    FOREIGN KEY (id) REFERENCES auth(id) ON DELETE CASCADE
);