CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT NOT NULL,
    user_type TEXT CHECK (user_type IN ('guest','user','admin')),
    token_hash TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (id) REFERENCES auth(id) ON DELETE CASCADE
);