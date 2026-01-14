CREATE TABLE IF NOT EXISTS profiles (
id TEXT NOT NULL UNIQUE,
username TEXT NOT NULL,
genender TEXT,
CHECK (genender IS NULL OR genender IN ('male', 'female'))
)