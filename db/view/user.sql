DROP VIEW IF EXISTS user_info;
CREATE VIEW user_info AS
SELECT 
    a.id,
    a.username,
    p.gender,
    (SELECT COUNT(*) FROM refresh_tokens AS r WHERE r.id = a.id) AS online_devices_count
FROM auth AS a
LEFT JOIN profiles AS p ON a.id = p.id;