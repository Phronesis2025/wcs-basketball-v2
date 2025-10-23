-- SQL statements to add 12 players to each team
-- This script adds 216 players total (12 players × 18 teams)

-- First, let's get the team IDs (you'll need to replace these with actual team IDs from your database)
-- Run this query first to get the team IDs:
-- SELECT id, name, age_group, gender FROM teams ORDER BY age_group, gender, name;

-- U10 Boys Teams (3 teams)
-- WCS Blue (U10 Boys) - Team ID: [REPLACE_WITH_ACTUAL_ID]
-- WCS Fake (U10 Boys) - Team ID: [REPLACE_WITH_ACTUAL_ID]  
-- Test Team (U10 Boys) - Team ID: [REPLACE_WITH_ACTUAL_ID]

-- U12 Boys Teams (3 teams)
-- WCS Errors (U12 Boys) - Team ID: [REPLACE_WITH_ACTUAL_ID]
-- WCS Thunder (U12 Boys) - Team ID: [REPLACE_WITH_ACTUAL_ID]
-- WCS Warriors (U12 Boys) - Team ID: [REPLACE_WITH_ACTUAL_ID]

-- U12 Girls Teams (1 team)
-- WCS Eagles Elite (U12 Girls) - Team ID: [REPLACE_WITH_ACTUAL_ID]

-- U14 Boys Teams (2 teams)
-- WCS Falcons (U14 Boys) - Team ID: [REPLACE_WITH_ACTUAL_ID]
-- WCS Lightning (U14 Boys) - Team ID: [REPLACE_WITH_ACTUAL_ID]

-- U14 Girls Teams (1 team)
-- WCS Sharks (U14 Girls) - Team ID: [REPLACE_WITH_ACTUAL_ID]

-- U16 Boys Teams (0 teams - all U16 are girls)

-- U16 Girls Teams (4 teams)
-- WCS Dupy (U16 Girls) - Team ID: [REPLACE_WITH_ACTUAL_ID]
-- WCS Potter (U16 Girls) - Team ID: [REPLACE_WITH_ACTUAL_ID]
-- WCS Red (U16 Girls) - Team ID: [REPLACE_WITH_ACTUAL_ID]
-- WCS Swish (U16 Girls) - Team ID: [REPLACE_WITH_ACTUAL_ID]
-- WCS Vipers (U16 Girls) - Team ID: [REPLACE_WITH_ACTUAL_ID]
-- WCS Williams (U16 Girls) - Team ID: [REPLACE_WITH_ACTUAL_ID]

-- U18 Boys Teams (1 team)
-- WCS Legends (U18 Boys) - Team ID: [REPLACE_WITH_ACTUAL_ID]

-- Test Team (U10 Boys) - Team ID: [REPLACE_WITH_ACTUAL_ID]

-- Example INSERT statements for WCS Blue (U10 Boys) - Replace [TEAM_ID] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID]', 'Player 1', 1, '5th', '2015-01-15', 9, 'Parent 1', 'parent1@email.com', '555-0001', 'Emergency 1', '555-0002', true, NOW()),
('[TEAM_ID]', 'Player 2', 2, '5th', '2015-03-20', 9, 'Parent 2', 'parent2@email.com', '555-0003', 'Emergency 2', '555-0004', true, NOW()),
('[TEAM_ID]', 'Player 3', 3, '5th', '2015-06-10', 9, 'Parent 3', 'parent3@email.com', '555-0005', 'Emergency 3', '555-0006', true, NOW()),
('[TEAM_ID]', 'Player 4', 4, '5th', '2015-09-05', 9, 'Parent 4', 'parent4@email.com', '555-0007', 'Emergency 4', '555-0008', true, NOW()),
('[TEAM_ID]', 'Player 5', 5, '5th', '2015-12-12', 9, 'Parent 5', 'parent5@email.com', '555-0009', 'Emergency 5', '555-0010', true, NOW()),
('[TEAM_ID]', 'Player 6', 6, '5th', '2015-02-28', 9, 'Parent 6', 'parent6@email.com', '555-0011', 'Emergency 6', '555-0012', true, NOW()),
('[TEAM_ID]', 'Player 7', 7, '5th', '2015-04-15', 9, 'Parent 7', 'parent7@email.com', '555-0013', 'Emergency 7', '555-0014', true, NOW()),
('[TEAM_ID]', 'Player 8', 8, '5th', '2015-07-22', 9, 'Parent 8', 'parent8@email.com', '555-0015', 'Emergency 8', '555-0016', true, NOW()),
('[TEAM_ID]', 'Player 9', 9, '5th', '2015-10-08', 9, 'Parent 9', 'parent9@email.com', '555-0017', 'Emergency 9', '555-0018', true, NOW()),
('[TEAM_ID]', 'Player 10', 10, '5th', '2015-11-30', 9, 'Parent 10', 'parent10@email.com', '555-0019', 'Emergency 10', '555-0020', true, NOW()),
('[TEAM_ID]', 'Player 11', 11, '5th', '2015-05-18', 9, 'Parent 11', 'parent11@email.com', '555-0021', 'Emergency 11', '555-0022', true, NOW()),
('[TEAM_ID]', 'Player 12', 12, '5th', '2015-08-25', 9, 'Parent 12', 'parent12@email.com', '555-0023', 'Emergency 12', '555-0024', true, NOW());

-- Example INSERT statements for WCS Errors (U12 Boys) - Replace [TEAM_ID] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID]', 'Player 1', 1, '7th', '2012-01-15', 12, 'Parent 1', 'parent1@email.com', '555-0001', 'Emergency 1', '555-0002', true, NOW()),
('[TEAM_ID]', 'Player 2', 2, '7th', '2012-03-20', 12, 'Parent 2', 'parent2@email.com', '555-0003', 'Emergency 2', '555-0004', true, NOW()),
('[TEAM_ID]', 'Player 3', 3, '7th', '2012-06-10', 12, 'Parent 3', 'parent3@email.com', '555-0005', 'Emergency 3', '555-0006', true, NOW()),
('[TEAM_ID]', 'Player 4', 4, '7th', '2012-09-05', 12, 'Parent 4', 'parent4@email.com', '555-0007', 'Emergency 4', '555-0008', true, NOW()),
('[TEAM_ID]', 'Player 5', 5, '7th', '2012-12-12', 12, 'Parent 5', 'parent5@email.com', '555-0009', 'Emergency 5', '555-0010', true, NOW()),
('[TEAM_ID]', 'Player 6', 6, '7th', '2012-02-28', 12, 'Parent 6', 'parent6@email.com', '555-0011', 'Emergency 6', '555-0012', true, NOW()),
('[TEAM_ID]', 'Player 7', 7, '7th', '2012-04-15', 12, 'Parent 7', 'parent7@email.com', '555-0013', 'Emergency 7', '555-0014', true, NOW()),
('[TEAM_ID]', 'Player 8', 8, '7th', '2012-07-22', 12, 'Parent 8', 'parent8@email.com', '555-0015', 'Emergency 8', '555-0016', true, NOW()),
('[TEAM_ID]', 'Player 9', 9, '7th', '2012-10-08', 12, 'Parent 9', 'parent9@email.com', '555-0017', 'Emergency 9', '555-0018', true, NOW()),
('[TEAM_ID]', 'Player 10', 10, '7th', '2012-11-30', 12, 'Parent 10', 'parent10@email.com', '555-0019', 'Emergency 10', '555-0020', true, NOW()),
('[TEAM_ID]', 'Player 11', 11, '7th', '2012-05-18', 12, 'Parent 11', 'parent11@email.com', '555-0021', 'Emergency 11', '555-0022', true, NOW()),
('[TEAM_ID]', 'Player 12', 12, '7th', '2012-08-25', 12, 'Parent 12', 'parent12@email.com', '555-0023', 'Emergency 12', '555-0024', true, NOW());

-- Example INSERT statements for WCS Falcons (U14 Boys) - Replace [TEAM_ID] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID]', 'Player 1', 1, '9th', '2010-01-15', 14, 'Parent 1', 'parent1@email.com', '555-0001', 'Emergency 1', '555-0002', true, NOW()),
('[TEAM_ID]', 'Player 2', 2, '9th', '2010-03-20', 14, 'Parent 2', 'parent2@email.com', '555-0003', 'Emergency 2', '555-0004', true, NOW()),
('[TEAM_ID]', 'Player 3', 3, '9th', '2010-06-10', 14, 'Parent 3', 'parent3@email.com', '555-0005', 'Emergency 3', '555-0006', true, NOW()),
('[TEAM_ID]', 'Player 4', 4, '9th', '2010-09-05', 14, 'Parent 4', 'parent4@email.com', '555-0007', 'Emergency 4', '555-0008', true, NOW()),
('[TEAM_ID]', 'Player 5', 5, '9th', '2010-12-12', 14, 'Parent 5', 'parent5@email.com', '555-0009', 'Emergency 5', '555-0010', true, NOW()),
('[TEAM_ID]', 'Player 6', 6, '9th', '2010-02-28', 14, 'Parent 6', 'parent6@email.com', '555-0011', 'Emergency 6', '555-0012', true, NOW()),
('[TEAM_ID]', 'Player 7', 7, '9th', '2010-04-15', 14, 'Parent 7', 'parent7@email.com', '555-0013', 'Emergency 7', '555-0014', true, NOW()),
('[TEAM_ID]', 'Player 8', 8, '9th', '2010-07-22', 14, 'Parent 8', 'parent8@email.com', '555-0015', 'Emergency 8', '555-0016', true, NOW()),
('[TEAM_ID]', 'Player 9', 9, '9th', '2010-10-08', 14, 'Parent 9', 'parent9@email.com', '555-0017', 'Emergency 9', '555-0018', true, NOW()),
('[TEAM_ID]', 'Player 10', 10, '9th', '2010-11-30', 14, 'Parent 10', 'parent10@email.com', '555-0019', 'Emergency 10', '555-0020', true, NOW()),
('[TEAM_ID]', 'Player 11', 11, '9th', '2010-05-18', 14, 'Parent 11', 'parent11@email.com', '555-0021', 'Emergency 11', '555-0022', true, NOW()),
('[TEAM_ID]', 'Player 12', 12, '9th', '2010-08-25', 14, 'Parent 12', 'parent12@email.com', '555-0023', 'Emergency 12', '555-0024', true, NOW());

-- Example INSERT statements for WCS Dupy (U16 Girls) - Replace [TEAM_ID] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID]', 'Player 1', 1, '11th', '2008-01-15', 16, 'Parent 1', 'parent1@email.com', '555-0001', 'Emergency 1', '555-0002', true, NOW()),
('[TEAM_ID]', 'Player 2', 2, '11th', '2008-03-20', 16, 'Parent 2', 'parent2@email.com', '555-0003', 'Emergency 2', '555-0004', true, NOW()),
('[TEAM_ID]', 'Player 3', 3, '11th', '2008-06-10', 16, 'Parent 3', 'parent3@email.com', '555-0005', 'Emergency 3', '555-0006', true, NOW()),
('[TEAM_ID]', 'Player 4', 4, '11th', '2008-09-05', 16, 'Parent 4', 'parent4@email.com', '555-0007', 'Emergency 4', '555-0008', true, NOW()),
('[TEAM_ID]', 'Player 5', 5, '11th', '2008-12-12', 16, 'Parent 5', 'parent5@email.com', '555-0009', 'Emergency 5', '555-0010', true, NOW()),
('[TEAM_ID]', 'Player 6', 6, '11th', '2008-02-28', 16, 'Parent 6', 'parent6@email.com', '555-0011', 'Emergency 6', '555-0012', true, NOW()),
('[TEAM_ID]', 'Player 7', 7, '11th', '2008-04-15', 16, 'Parent 7', 'parent7@email.com', '555-0013', 'Emergency 7', '555-0014', true, NOW()),
('[TEAM_ID]', 'Player 8', 8, '11th', '2008-07-22', 16, 'Parent 8', 'parent8@email.com', '555-0015', 'Emergency 8', '555-0016', true, NOW()),
('[TEAM_ID]', 'Player 9', 9, '11th', '2008-10-08', 16, 'Parent 9', 'parent9@email.com', '555-0017', 'Emergency 9', '555-0018', true, NOW()),
('[TEAM_ID]', 'Player 10', 10, '11th', '2008-11-30', 16, 'Parent 10', 'parent10@email.com', '555-0019', 'Emergency 10', '555-0020', true, NOW()),
('[TEAM_ID]', 'Player 11', 11, '11th', '2008-05-18', 16, 'Parent 11', 'parent11@email.com', '555-0021', 'Emergency 11', '555-0022', true, NOW()),
('[TEAM_ID]', 'Player 12', 12, '11th', '2008-08-25', 16, 'Parent 12', 'parent12@email.com', '555-0023', 'Emergency 12', '555-0024', true, NOW());

-- Example INSERT statements for WCS Legends (U18 Boys) - Replace [TEAM_ID] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID]', 'Player 1', 1, '12th', '2006-01-15', 18, 'Parent 1', 'parent1@email.com', '555-0001', 'Emergency 1', '555-0002', true, NOW()),
('[TEAM_ID]', 'Player 2', 2, '12th', '2006-03-20', 18, 'Parent 2', 'parent2@email.com', '555-0003', 'Emergency 2', '555-0004', true, NOW()),
('[TEAM_ID]', 'Player 3', 3, '12th', '2006-06-10', 18, 'Parent 3', 'parent3@email.com', '555-0005', 'Emergency 3', '555-0006', true, NOW()),
('[TEAM_ID]', 'Player 4', 4, '12th', '2006-09-05', 18, 'Parent 4', 'parent4@email.com', '555-0007', 'Emergency 4', '555-0008', true, NOW()),
('[TEAM_ID]', 'Player 5', 5, '12th', '2006-12-12', 18, 'Parent 5', 'parent5@email.com', '555-0009', 'Emergency 5', '555-0010', true, NOW()),
('[TEAM_ID]', 'Player 6', 6, '12th', '2006-02-28', 18, 'Parent 6', 'parent6@email.com', '555-0011', 'Emergency 6', '555-0012', true, NOW()),
('[TEAM_ID]', 'Player 7', 7, '12th', '2006-04-15', 18, 'Parent 7', 'parent7@email.com', '555-0013', 'Emergency 7', '555-0014', true, NOW()),
('[TEAM_ID]', 'Player 8', 8, '12th', '2006-07-22', 18, 'Parent 8', 'parent8@email.com', '555-0015', 'Emergency 8', '555-0016', true, NOW()),
('[TEAM_ID]', 'Player 9', 9, '12th', '2006-10-08', 18, 'Parent 9', 'parent9@email.com', '555-0017', 'Emergency 9', '555-0018', true, NOW()),
('[TEAM_ID]', 'Player 10', 10, '12th', '2006-11-30', 18, 'Parent 10', 'parent10@email.com', '555-0019', 'Emergency 10', '555-0020', true, NOW()),
('[TEAM_ID]', 'Player 11', 11, '12th', '2006-05-18', 18, 'Parent 11', 'parent11@email.com', '555-0021', 'Emergency 11', '555-0022', true, NOW()),
('[TEAM_ID]', 'Player 12', 12, '12th', '2006-08-25', 18, 'Parent 12', 'parent12@email.com', '555-0023', 'Emergency 12', '555-0024', true, NOW());

-- Instructions:
-- 1. First, run this query to get all team IDs:
--    SELECT id, name, age_group, gender FROM teams ORDER BY age_group, gender, name;
--
-- 2. Replace [TEAM_ID] placeholders with actual team IDs from step 1
--
-- 3. For each team, copy the appropriate INSERT statement template and replace [TEAM_ID]
--
-- 4. Adjust the age and grade values based on the team's age group:
--    - U10: age 9-10, grade 5th
--    - U12: age 11-12, grade 7th  
--    - U14: age 13-14, grade 9th
--    - U16: age 15-16, grade 11th
--    - U18: age 17-18, grade 12th
--
-- 5. Run the INSERT statements for each team
--
-- 6. Verify the data with:
--    SELECT t.name, t.age_group, t.gender, COUNT(p.id) as player_count 
--    FROM teams t 
--    LEFT JOIN players p ON t.id = p.team_id 
--    GROUP BY t.id, t.name, t.age_group, t.gender 
--    ORDER BY t.age_group, t.gender, t.name;
