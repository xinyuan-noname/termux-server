DROP VIEW IF EXISTS user_info;
CREATE VIEW user_info AS
SELECT 
    a.id,
    a.username,
    a.password_required,
    a.is_admin,
    p.gender,
    p.major,
    p.class,
    p.academy,
    NULLIF(TRIM(p.position), '') AS position
FROM auth AS a
LEFT JOIN profiles AS p ON a.id = p.id;