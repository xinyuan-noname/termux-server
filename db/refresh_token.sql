CREATE TABLE IF NOT EXISTS refresh_token (
id TEXT NOT NULL,
user_type TEXT,
token_hash TEXT NOT NULL UNIQUE,
created_at INTEGER NOT NULL,
expires_at INTEGER NOT NULL
)