DROP TRIGGER IF EXISTS auto_create_profiles;
CREATE TRIGGER auto_create_profiles
AFTER INSERT ON auth
BEGIN 
    INSERT INTO profiles (id) VALUES (New.id);
END