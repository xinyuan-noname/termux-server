CREATE TABLE IF NOT EXISTS auth (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    password_hash TEXT,
    password_required INTEGER DEFAULT 0 CHECK (password_required IN (0, 1)),
    is_admin INTEGER DEFAULT 0 CHECK (is_admin IN (0, 1)),
    CHECK ((is_admin = 0) OR (password_required = 0) OR (password_hash IS NOT NULL))
);