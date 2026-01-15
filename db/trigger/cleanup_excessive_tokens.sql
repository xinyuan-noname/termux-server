DROP TRIGGER IF EXISTS cleanup_excessive_tokens;
CREATE TRIGGER cleanup_excessive_tokens
AFTER INSERT ON refresh_tokens
BEGIN 
    DELETE FROM refresh_tokens 
    WHERE token_hash NOT IN (
        SELECT token_hash 
        FROM refresh_tokens 
        WHERE id = NEW.id 
        ORDER BY created_at DESC
        LIMIT 3
    ) AND id = NEW.id;
END