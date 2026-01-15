CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    gender TEXT CHECK (gender IS NULL OR gender IN ('male', 'female')),
    FOREIGN KEY (id) REFERENCES auth(id) ON DELETE CASCADE
)