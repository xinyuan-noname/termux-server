CREATE TABLE IF NOT EXISTS task_vote_record(
    task_id INTEGER NOT NULL,
    option_id INTEGER NOT NULL,
    voter_id TEXT NOT NULL,
    voted_at INTEGER NOT NULL,
    PRIMARY KEY (task_id, voter_id, option_id),
    FOREIGN KEY (task_id) REFERENCES task_config(task_id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES task_vote_option(option_id) ON DELETE CASCADE,
    FOREIGN KEY (voter_id) REFERENCES auth(id) ON DELETE CASCADE
);
