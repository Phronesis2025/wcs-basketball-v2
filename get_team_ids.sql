-- Query to get all team IDs for the bulk player insertion
-- Run this first to get the actual team IDs

SELECT 
    id, 
    name, 
    age_group, 
    gender,
    CONCAT(name, ' (', age_group, ' ', gender, ')') as full_name
FROM teams 
ORDER BY age_group, gender, name;
