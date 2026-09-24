CREATE TABLE IF NOT EXISTS user_like(
    like_id INTEGER PRIMARY KEY,
    liker_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    like_day TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE (liker_id, target_id, like_day),
    FOREIGN KEY (liker_id) REFERENCES auth(id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES auth(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_like_target ON user_like(target_id);

CREATE INDEX IF NOT EXISTS idx_user_like_liker_day ON user_like(liker_id, like_day);
