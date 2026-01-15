CREATE TRIGGER cleanup_expired_tokens
AFTER INSERT ON refresh_tokens
BEGIN 
    DELETE FROM refresh_tokens
    WHERE expires_at < strftime('%s','now');
END;