CREATE TABLE IF NOT EXISTS password_key (
    id TEXT PRIMARY KEY,
    password_key_hash TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (id) REFERENCES auth(id) ON DELETE CASCADE
);