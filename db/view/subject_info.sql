CREATE VIEW IF NOT EXISTS subject_info AS
SELECT 
    s.subject_name,
    s.credit,
    s.course_type,
    s.alias,
    s.teachers,
    s.semester,
    CASE 
        WHEN COUNT(c.weekday) = 0 THEN json('[]')
        ELSE json_group_array(
            json_object(
                'weeks', c.weeks,
                'weekday', c.weekday,
                'location', c.location,
                'biweekly', c.biweekly,
                'period', c.period
            )
        )
    END AS schedule
FROM 
    subjects s
LEFT JOIN 
    courses c ON s.subject_name = c.subject_name
GROUP BY 
    s.subject_name;