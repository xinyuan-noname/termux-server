DROP TRIGGER IF EXISTS cleanup_expired_pswd_key;
CREATE TRIGGER cleanup_expired_pswd_key
AFTER INSERT ON password_key
BEGIN
    DELETE FROM password_key 
    WHERE expires_at < strftime('%s','now');
END