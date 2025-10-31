-- Complete SQL script to add 12 players to each of the 18 teams
-- Total: 216 players (12 players × 18 teams)
-- 
-- INSTRUCTIONS:
-- 1. First run: get_team_ids.sql to get actual team IDs
-- 2. Replace all [TEAM_ID] placeholders with actual team IDs
-- 3. Run this script to add all players

-- =============================================================================
-- U10 BOYS TEAMS (3 teams)
-- =============================================================================

-- WCS Blue (U10 Boys) - Replace [TEAM_ID_1] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID_1]', 'WCS Blue Player 1', 1, '5th', '2015-01-15', 9, 'Blue Parent 1', 'blue1@email.com', '555-0101', 'Blue Emergency 1', '555-0102', true, NOW()),
('[TEAM_ID_1]', 'WCS Blue Player 2', 2, '5th', '2015-03-20', 9, 'Blue Parent 2', 'blue2@email.com', '555-0103', 'Blue Emergency 2', '555-0104', true, NOW()),
('[TEAM_ID_1]', 'WCS Blue Player 3', 3, '5th', '2015-06-10', 9, 'Blue Parent 3', 'blue3@email.com', '555-0105', 'Blue Emergency 3', '555-0106', true, NOW()),
('[TEAM_ID_1]', 'WCS Blue Player 4', 4, '5th', '2015-09-05', 9, 'Blue Parent 4', 'blue4@email.com', '555-0107', 'Blue Emergency 4', '555-0108', true, NOW()),
('[TEAM_ID_1]', 'WCS Blue Player 5', 5, '5th', '2015-12-12', 9, 'Blue Parent 5', 'blue5@email.com', '555-0109', 'Blue Emergency 5', '555-0110', true, NOW()),
('[TEAM_ID_1]', 'WCS Blue Player 6', 6, '5th', '2015-02-28', 9, 'Blue Parent 6', 'blue6@email.com', '555-0111', 'Blue Emergency 6', '555-0112', true, NOW()),
('[TEAM_ID_1]', 'WCS Blue Player 7', 7, '5th', '2015-04-15', 9, 'Blue Parent 7', 'blue7@email.com', '555-0113', 'Blue Emergency 7', '555-0114', true, NOW()),
('[TEAM_ID_1]', 'WCS Blue Player 8', 8, '5th', '2015-07-22', 9, 'Blue Parent 8', 'blue8@email.com', '555-0115', 'Blue Emergency 8', '555-0116', true, NOW()),
('[TEAM_ID_1]', 'WCS Blue Player 9', 9, '5th', '2015-10-08', 9, 'Blue Parent 9', 'blue9@email.com', '555-0117', 'Blue Emergency 9', '555-0118', true, NOW()),
('[TEAM_ID_1]', 'WCS Blue Player 10', 10, '5th', '2015-11-30', 9, 'Blue Parent 10', 'blue10@email.com', '555-0119', 'Blue Emergency 10', '555-0120', true, NOW()),
('[TEAM_ID_1]', 'WCS Blue Player 11', 11, '5th', '2015-05-18', 9, 'Blue Parent 11', 'blue11@email.com', '555-0121', 'Blue Emergency 11', '555-0122', true, NOW()),
('[TEAM_ID_1]', 'WCS Blue Player 12', 12, '5th', '2015-08-25', 9, 'Blue Parent 12', 'blue12@email.com', '555-0123', 'Blue Emergency 12', '555-0124', true, NOW());

-- WCS Fake (U10 Boys) - Replace [TEAM_ID_2] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID_2]', 'WCS Fake Player 1', 1, '5th', '2015-01-15', 9, 'Fake Parent 1', 'fake1@email.com', '555-0201', 'Fake Emergency 1', '555-0202', true, NOW()),
('[TEAM_ID_2]', 'WCS Fake Player 2', 2, '5th', '2015-03-20', 9, 'Fake Parent 2', 'fake2@email.com', '555-0203', 'Fake Emergency 2', '555-0204', true, NOW()),
('[TEAM_ID_2]', 'WCS Fake Player 3', 3, '5th', '2015-06-10', 9, 'Fake Parent 3', 'fake3@email.com', '555-0205', 'Fake Emergency 3', '555-0206', true, NOW()),
('[TEAM_ID_2]', 'WCS Fake Player 4', 4, '5th', '2015-09-05', 9, 'Fake Parent 4', 'fake4@email.com', '555-0207', 'Fake Emergency 4', '555-0208', true, NOW()),
('[TEAM_ID_2]', 'WCS Fake Player 5', 5, '5th', '2015-12-12', 9, 'Fake Parent 5', 'fake5@email.com', '555-0209', 'Fake Emergency 5', '555-0210', true, NOW()),
('[TEAM_ID_2]', 'WCS Fake Player 6', 6, '5th', '2015-02-28', 9, 'Fake Parent 6', 'fake6@email.com', '555-0211', 'Fake Emergency 6', '555-0212', true, NOW()),
('[TEAM_ID_2]', 'WCS Fake Player 7', 7, '5th', '2015-04-15', 9, 'Fake Parent 7', 'fake7@email.com', '555-0213', 'Fake Emergency 7', '555-0214', true, NOW()),
('[TEAM_ID_2]', 'WCS Fake Player 8', 8, '5th', '2015-07-22', 9, 'Fake Parent 8', 'fake8@email.com', '555-0215', 'Fake Emergency 8', '555-0216', true, NOW()),
('[TEAM_ID_2]', 'WCS Fake Player 9', 9, '5th', '2015-10-08', 9, 'Fake Parent 9', 'fake9@email.com', '555-0217', 'Fake Emergency 9', '555-0218', true, NOW()),
('[TEAM_ID_2]', 'WCS Fake Player 10', 10, '5th', '2015-11-30', 9, 'Fake Parent 10', 'fake10@email.com', '555-0219', 'Fake Emergency 10', '555-0220', true, NOW()),
('[TEAM_ID_2]', 'WCS Fake Player 11', 11, '5th', '2015-05-18', 9, 'Fake Parent 11', 'fake11@email.com', '555-0221', 'Fake Emergency 11', '555-0222', true, NOW()),
('[TEAM_ID_2]', 'WCS Fake Player 12', 12, '5th', '2015-08-25', 9, 'Fake Parent 12', 'fake12@email.com', '555-0223', 'Fake Emergency 12', '555-0224', true, NOW());

-- Test Team (U10 Boys) - Replace [TEAM_ID_3] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID_3]', 'Test Team Player 1', 1, '5th', '2015-01-15', 9, 'Test Parent 1', 'test1@email.com', '555-0301', 'Test Emergency 1', '555-0302', true, NOW()),
('[TEAM_ID_3]', 'Test Team Player 2', 2, '5th', '2015-03-20', 9, 'Test Parent 2', 'test2@email.com', '555-0303', 'Test Emergency 2', '555-0304', true, NOW()),
('[TEAM_ID_3]', 'Test Team Player 3', 3, '5th', '2015-06-10', 9, 'Test Parent 3', 'test3@email.com', '555-0305', 'Test Emergency 3', '555-0306', true, NOW()),
('[TEAM_ID_3]', 'Test Team Player 4', 4, '5th', '2015-09-05', 9, 'Test Parent 4', 'test4@email.com', '555-0307', 'Test Emergency 4', '555-0308', true, NOW()),
('[TEAM_ID_3]', 'Test Team Player 5', 5, '5th', '2015-12-12', 9, 'Test Parent 5', 'test5@email.com', '555-0309', 'Test Emergency 5', '555-0310', true, NOW()),
('[TEAM_ID_3]', 'Test Team Player 6', 6, '5th', '2015-02-28', 9, 'Test Parent 6', 'test6@email.com', '555-0311', 'Test Emergency 6', '555-0312', true, NOW()),
('[TEAM_ID_3]', 'Test Team Player 7', 7, '5th', '2015-04-15', 9, 'Test Parent 7', 'test7@email.com', '555-0313', 'Test Emergency 7', '555-0314', true, NOW()),
('[TEAM_ID_3]', 'Test Team Player 8', 8, '5th', '2015-07-22', 9, 'Test Parent 8', 'test8@email.com', '555-0315', 'Test Emergency 8', '555-0316', true, NOW()),
('[TEAM_ID_3]', 'Test Team Player 9', 9, '5th', '2015-10-08', 9, 'Test Parent 9', 'test9@email.com', '555-0317', 'Test Emergency 9', '555-0318', true, NOW()),
('[TEAM_ID_3]', 'Test Team Player 10', 10, '5th', '2015-11-30', 9, 'Test Parent 10', 'test10@email.com', '555-0319', 'Test Emergency 10', '555-0320', true, NOW()),
('[TEAM_ID_3]', 'Test Team Player 11', 11, '5th', '2015-05-18', 9, 'Test Parent 11', 'test11@email.com', '555-0321', 'Test Emergency 11', '555-0322', true, NOW()),
('[TEAM_ID_3]', 'Test Team Player 12', 12, '5th', '2015-08-25', 9, 'Test Parent 12', 'test12@email.com', '555-0323', 'Test Emergency 12', '555-0324', true, NOW());

-- =============================================================================
-- U12 BOYS TEAMS (3 teams)
-- =============================================================================

-- WCS Errors (U12 Boys) - Replace [TEAM_ID_4] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID_4]', 'WCS Errors Player 1', 1, '7th', '2012-01-15', 12, 'Errors Parent 1', 'errors1@email.com', '555-0401', 'Errors Emergency 1', '555-0402', true, NOW()),
('[TEAM_ID_4]', 'WCS Errors Player 2', 2, '7th', '2012-03-20', 12, 'Errors Parent 2', 'errors2@email.com', '555-0403', 'Errors Emergency 2', '555-0404', true, NOW()),
('[TEAM_ID_4]', 'WCS Errors Player 3', 3, '7th', '2012-06-10', 12, 'Errors Parent 3', 'errors3@email.com', '555-0405', 'Errors Emergency 3', '555-0406', true, NOW()),
('[TEAM_ID_4]', 'WCS Errors Player 4', 4, '7th', '2012-09-05', 12, 'Errors Parent 4', 'errors4@email.com', '555-0407', 'Errors Emergency 4', '555-0408', true, NOW()),
('[TEAM_ID_4]', 'WCS Errors Player 5', 5, '7th', '2012-12-12', 12, 'Errors Parent 5', 'errors5@email.com', '555-0409', 'Errors Emergency 5', '555-0410', true, NOW()),
('[TEAM_ID_4]', 'WCS Errors Player 6', 6, '7th', '2012-02-28', 12, 'Errors Parent 6', 'errors6@email.com', '555-0411', 'Errors Emergency 6', '555-0412', true, NOW()),
('[TEAM_ID_4]', 'WCS Errors Player 7', 7, '7th', '2012-04-15', 12, 'Errors Parent 7', 'errors7@email.com', '555-0413', 'Errors Emergency 7', '555-0414', true, NOW()),
('[TEAM_ID_4]', 'WCS Errors Player 8', 8, '7th', '2012-07-22', 12, 'Errors Parent 8', 'errors8@email.com', '555-0415', 'Errors Emergency 8', '555-0416', true, NOW()),
('[TEAM_ID_4]', 'WCS Errors Player 9', 9, '7th', '2012-10-08', 12, 'Errors Parent 9', 'errors9@email.com', '555-0417', 'Errors Emergency 9', '555-0418', true, NOW()),
('[TEAM_ID_4]', 'WCS Errors Player 10', 10, '7th', '2012-11-30', 12, 'Errors Parent 10', 'errors10@email.com', '555-0419', 'Errors Emergency 10', '555-0420', true, NOW()),
('[TEAM_ID_4]', 'WCS Errors Player 11', 11, '7th', '2012-05-18', 12, 'Errors Parent 11', 'errors11@email.com', '555-0421', 'Errors Emergency 11', '555-0422', true, NOW()),
('[TEAM_ID_4]', 'WCS Errors Player 12', 12, '7th', '2012-08-25', 12, 'Errors Parent 12', 'errors12@email.com', '555-0423', 'Errors Emergency 12', '555-0424', true, NOW());

-- WCS Thunder (U12 Boys) - Replace [TEAM_ID_5] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID_5]', 'WCS Thunder Player 1', 1, '7th', '2012-01-15', 12, 'Thunder Parent 1', 'thunder1@email.com', '555-0501', 'Thunder Emergency 1', '555-0502', true, NOW()),
('[TEAM_ID_5]', 'WCS Thunder Player 2', 2, '7th', '2012-03-20', 12, 'Thunder Parent 2', 'thunder2@email.com', '555-0503', 'Thunder Emergency 2', '555-0504', true, NOW()),
('[TEAM_ID_5]', 'WCS Thunder Player 3', 3, '7th', '2012-06-10', 12, 'Thunder Parent 3', 'thunder3@email.com', '555-0505', 'Thunder Emergency 3', '555-0506', true, NOW()),
('[TEAM_ID_5]', 'WCS Thunder Player 4', 4, '7th', '2012-09-05', 12, 'Thunder Parent 4', 'thunder4@email.com', '555-0507', 'Thunder Emergency 4', '555-0508', true, NOW()),
('[TEAM_ID_5]', 'WCS Thunder Player 5', 5, '7th', '2012-12-12', 12, 'Thunder Parent 5', 'thunder5@email.com', '555-0509', 'Thunder Emergency 5', '555-0510', true, NOW()),
('[TEAM_ID_5]', 'WCS Thunder Player 6', 6, '7th', '2012-02-28', 12, 'Thunder Parent 6', 'thunder6@email.com', '555-0511', 'Thunder Emergency 6', '555-0512', true, NOW()),
('[TEAM_ID_5]', 'WCS Thunder Player 7', 7, '7th', '2012-04-15', 12, 'Thunder Parent 7', 'thunder7@email.com', '555-0513', 'Thunder Emergency 7', '555-0514', true, NOW()),
('[TEAM_ID_5]', 'WCS Thunder Player 8', 8, '7th', '2012-07-22', 12, 'Thunder Parent 8', 'thunder8@email.com', '555-0515', 'Thunder Emergency 8', '555-0516', true, NOW()),
('[TEAM_ID_5]', 'WCS Thunder Player 9', 9, '7th', '2012-10-08', 12, 'Thunder Parent 9', 'thunder9@email.com', '555-0517', 'Thunder Emergency 9', '555-0518', true, NOW()),
('[TEAM_ID_5]', 'WCS Thunder Player 10', 10, '7th', '2012-11-30', 12, 'Thunder Parent 10', 'thunder10@email.com', '555-0519', 'Thunder Emergency 10', '555-0520', true, NOW()),
('[TEAM_ID_5]', 'WCS Thunder Player 11', 11, '7th', '2012-05-18', 12, 'Thunder Parent 11', 'thunder11@email.com', '555-0521', 'Thunder Emergency 11', '555-0522', true, NOW()),
('[TEAM_ID_5]', 'WCS Thunder Player 12', 12, '7th', '2012-08-25', 12, 'Thunder Parent 12', 'thunder12@email.com', '555-0523', 'Thunder Emergency 12', '555-0524', true, NOW());

-- WCS Warriors (U12 Boys) - Replace [TEAM_ID_6] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID_6]', 'WCS Warriors Player 1', 1, '7th', '2012-01-15', 12, 'Warriors Parent 1', 'warriors1@email.com', '555-0601', 'Warriors Emergency 1', '555-0602', true, NOW()),
('[TEAM_ID_6]', 'WCS Warriors Player 2', 2, '7th', '2012-03-20', 12, 'Warriors Parent 2', 'warriors2@email.com', '555-0603', 'Warriors Emergency 2', '555-0604', true, NOW()),
('[TEAM_ID_6]', 'WCS Warriors Player 3', 3, '7th', '2012-06-10', 12, 'Warriors Parent 3', 'warriors3@email.com', '555-0605', 'Warriors Emergency 3', '555-0606', true, NOW()),
('[TEAM_ID_6]', 'WCS Warriors Player 4', 4, '7th', '2012-09-05', 12, 'Warriors Parent 4', 'warriors4@email.com', '555-0607', 'Warriors Emergency 4', '555-0608', true, NOW()),
('[TEAM_ID_6]', 'WCS Warriors Player 5', 5, '7th', '2012-12-12', 12, 'Warriors Parent 5', 'warriors5@email.com', '555-0609', 'Warriors Emergency 5', '555-0610', true, NOW()),
('[TEAM_ID_6]', 'WCS Warriors Player 6', 6, '7th', '2012-02-28', 12, 'Warriors Parent 6', 'warriors6@email.com', '555-0611', 'Warriors Emergency 6', '555-0612', true, NOW()),
('[TEAM_ID_6]', 'WCS Warriors Player 7', 7, '7th', '2012-04-15', 12, 'Warriors Parent 7', 'warriors7@email.com', '555-0613', 'Warriors Emergency 7', '555-0614', true, NOW()),
('[TEAM_ID_6]', 'WCS Warriors Player 8', 8, '7th', '2012-07-22', 12, 'Warriors Parent 8', 'warriors8@email.com', '555-0615', 'Warriors Emergency 8', '555-0616', true, NOW()),
('[TEAM_ID_6]', 'WCS Warriors Player 9', 9, '7th', '2012-10-08', 12, 'Warriors Parent 9', 'warriors9@email.com', '555-0617', 'Warriors Emergency 9', '555-0618', true, NOW()),
('[TEAM_ID_6]', 'WCS Warriors Player 10', 10, '7th', '2012-11-30', 12, 'Warriors Parent 10', 'warriors10@email.com', '555-0619', 'Warriors Emergency 10', '555-0620', true, NOW()),
('[TEAM_ID_6]', 'WCS Warriors Player 11', 11, '7th', '2012-05-18', 12, 'Warriors Parent 11', 'warriors11@email.com', '555-0621', 'Warriors Emergency 11', '555-0622', true, NOW()),
('[TEAM_ID_6]', 'WCS Warriors Player 12', 12, '7th', '2012-08-25', 12, 'Warriors Parent 12', 'warriors12@email.com', '555-0623', 'Warriors Emergency 12', '555-0624', true, NOW());

-- =============================================================================
-- U12 GIRLS TEAMS (1 team)
-- =============================================================================

-- WCS Eagles Elite (U12 Girls) - Replace [TEAM_ID_7] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID_7]', 'WCS Eagles Elite Player 1', 1, '7th', '2012-01-15', 12, 'Eagles Parent 1', 'eagles1@email.com', '555-0701', 'Eagles Emergency 1', '555-0702', true, NOW()),
('[TEAM_ID_7]', 'WCS Eagles Elite Player 2', 2, '7th', '2012-03-20', 12, 'Eagles Parent 2', 'eagles2@email.com', '555-0703', 'Eagles Emergency 2', '555-0704', true, NOW()),
('[TEAM_ID_7]', 'WCS Eagles Elite Player 3', 3, '7th', '2012-06-10', 12, 'Eagles Parent 3', 'eagles3@email.com', '555-0705', 'Eagles Emergency 3', '555-0706', true, NOW()),
('[TEAM_ID_7]', 'WCS Eagles Elite Player 4', 4, '7th', '2012-09-05', 12, 'Eagles Parent 4', 'eagles4@email.com', '555-0707', 'Eagles Emergency 4', '555-0708', true, NOW()),
('[TEAM_ID_7]', 'WCS Eagles Elite Player 5', 5, '7th', '2012-12-12', 12, 'Eagles Parent 5', 'eagles5@email.com', '555-0709', 'Eagles Emergency 5', '555-0710', true, NOW()),
('[TEAM_ID_7]', 'WCS Eagles Elite Player 6', 6, '7th', '2012-02-28', 12, 'Eagles Parent 6', 'eagles6@email.com', '555-0711', 'Eagles Emergency 6', '555-0712', true, NOW()),
('[TEAM_ID_7]', 'WCS Eagles Elite Player 7', 7, '7th', '2012-04-15', 12, 'Eagles Parent 7', 'eagles7@email.com', '555-0713', 'Eagles Emergency 7', '555-0714', true, NOW()),
('[TEAM_ID_7]', 'WCS Eagles Elite Player 8', 8, '7th', '2012-07-22', 12, 'Eagles Parent 8', 'eagles8@email.com', '555-0715', 'Eagles Emergency 8', '555-0716', true, NOW()),
('[TEAM_ID_7]', 'WCS Eagles Elite Player 9', 9, '7th', '2012-10-08', 12, 'Eagles Parent 9', 'eagles9@email.com', '555-0717', 'Eagles Emergency 9', '555-0718', true, NOW()),
('[TEAM_ID_7]', 'WCS Eagles Elite Player 10', 10, '7th', '2012-11-30', 12, 'Eagles Parent 10', 'eagles10@email.com', '555-0719', 'Eagles Emergency 10', '555-0720', true, NOW()),
('[TEAM_ID_7]', 'WCS Eagles Elite Player 11', 11, '7th', '2012-05-18', 12, 'Eagles Parent 11', 'eagles11@email.com', '555-0721', 'Eagles Emergency 11', '555-0722', true, NOW()),
('[TEAM_ID_7]', 'WCS Eagles Elite Player 12', 12, '7th', '2012-08-25', 12, 'Eagles Parent 12', 'eagles12@email.com', '555-0723', 'Eagles Emergency 12', '555-0724', true, NOW());

-- =============================================================================
-- U14 BOYS TEAMS (2 teams)
-- =============================================================================

-- WCS Falcons (U14 Boys) - Replace [TEAM_ID_8] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID_8]', 'WCS Falcons Player 1', 1, '9th', '2010-01-15', 14, 'Falcons Parent 1', 'falcons1@email.com', '555-0801', 'Falcons Emergency 1', '555-0802', true, NOW()),
('[TEAM_ID_8]', 'WCS Falcons Player 2', 2, '9th', '2010-03-20', 14, 'Falcons Parent 2', 'falcons2@email.com', '555-0803', 'Falcons Emergency 2', '555-0804', true, NOW()),
('[TEAM_ID_8]', 'WCS Falcons Player 3', 3, '9th', '2010-06-10', 14, 'Falcons Parent 3', 'falcons3@email.com', '555-0805', 'Falcons Emergency 3', '555-0806', true, NOW()),
('[TEAM_ID_8]', 'WCS Falcons Player 4', 4, '9th', '2010-09-05', 14, 'Falcons Parent 4', 'falcons4@email.com', '555-0807', 'Falcons Emergency 4', '555-0808', true, NOW()),
('[TEAM_ID_8]', 'WCS Falcons Player 5', 5, '9th', '2010-12-12', 14, 'Falcons Parent 5', 'falcons5@email.com', '555-0809', 'Falcons Emergency 5', '555-0810', true, NOW()),
('[TEAM_ID_8]', 'WCS Falcons Player 6', 6, '9th', '2010-02-28', 14, 'Falcons Parent 6', 'falcons6@email.com', '555-0811', 'Falcons Emergency 6', '555-0812', true, NOW()),
('[TEAM_ID_8]', 'WCS Falcons Player 7', 7, '9th', '2010-04-15', 14, 'Falcons Parent 7', 'falcons7@email.com', '555-0813', 'Falcons Emergency 7', '555-0814', true, NOW()),
('[TEAM_ID_8]', 'WCS Falcons Player 8', 8, '9th', '2010-07-22', 14, 'Falcons Parent 8', 'falcons8@email.com', '555-0815', 'Falcons Emergency 8', '555-0816', true, NOW()),
('[TEAM_ID_8]', 'WCS Falcons Player 9', 9, '9th', '2010-10-08', 14, 'Falcons Parent 9', 'falcons9@email.com', '555-0817', 'Falcons Emergency 9', '555-0818', true, NOW()),
('[TEAM_ID_8]', 'WCS Falcons Player 10', 10, '9th', '2010-11-30', 14, 'Falcons Parent 10', 'falcons10@email.com', '555-0819', 'Falcons Emergency 10', '555-0820', true, NOW()),
('[TEAM_ID_8]', 'WCS Falcons Player 11', 11, '9th', '2010-05-18', 14, 'Falcons Parent 11', 'falcons11@email.com', '555-0821', 'Falcons Emergency 11', '555-0822', true, NOW()),
('[TEAM_ID_8]', 'WCS Falcons Player 12', 12, '9th', '2010-08-25', 14, 'Falcons Parent 12', 'falcons12@email.com', '555-0823', 'Falcons Emergency 12', '555-0824', true, NOW());

-- WCS Lightning (U14 Boys) - Replace [TEAM_ID_9] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID_9]', 'WCS Lightning Player 1', 1, '9th', '2010-01-15', 14, 'Lightning Parent 1', 'lightning1@email.com', '555-0901', 'Lightning Emergency 1', '555-0902', true, NOW()),
('[TEAM_ID_9]', 'WCS Lightning Player 2', 2, '9th', '2010-03-20', 14, 'Lightning Parent 2', 'lightning2@email.com', '555-0903', 'Lightning Emergency 2', '555-0904', true, NOW()),
('[TEAM_ID_9]', 'WCS Lightning Player 3', 3, '9th', '2010-06-10', 14, 'Lightning Parent 3', 'lightning3@email.com', '555-0905', 'Lightning Emergency 3', '555-0906', true, NOW()),
('[TEAM_ID_9]', 'WCS Lightning Player 4', 4, '9th', '2010-09-05', 14, 'Lightning Parent 4', 'lightning4@email.com', '555-0907', 'Lightning Emergency 4', '555-0908', true, NOW()),
('[TEAM_ID_9]', 'WCS Lightning Player 5', 5, '9th', '2010-12-12', 14, 'Lightning Parent 5', 'lightning5@email.com', '555-0909', 'Lightning Emergency 5', '555-0910', true, NOW()),
('[TEAM_ID_9]', 'WCS Lightning Player 6', 6, '9th', '2010-02-28', 14, 'Lightning Parent 6', 'lightning6@email.com', '555-0911', 'Lightning Emergency 6', '555-0912', true, NOW()),
('[TEAM_ID_9]', 'WCS Lightning Player 7', 7, '9th', '2010-04-15', 14, 'Lightning Parent 7', 'lightning7@email.com', '555-0913', 'Lightning Emergency 7', '555-0914', true, NOW()),
('[TEAM_ID_9]', 'WCS Lightning Player 8', 8, '9th', '2010-07-22', 14, 'Lightning Parent 8', 'lightning8@email.com', '555-0915', 'Lightning Emergency 8', '555-0916', true, NOW()),
('[TEAM_ID_9]', 'WCS Lightning Player 9', 9, '9th', '2010-10-08', 14, 'Lightning Parent 9', 'lightning9@email.com', '555-0917', 'Lightning Emergency 9', '555-0918', true, NOW()),
('[TEAM_ID_9]', 'WCS Lightning Player 10', 10, '9th', '2010-11-30', 14, 'Lightning Parent 10', 'lightning10@email.com', '555-0919', 'Lightning Emergency 10', '555-0920', true, NOW()),
('[TEAM_ID_9]', 'WCS Lightning Player 11', 11, '9th', '2010-05-18', 14, 'Lightning Parent 11', 'lightning11@email.com', '555-0921', 'Lightning Emergency 11', '555-0922', true, NOW()),
('[TEAM_ID_9]', 'WCS Lightning Player 12', 12, '9th', '2010-08-25', 14, 'Lightning Parent 12', 'lightning12@email.com', '555-0923', 'Lightning Emergency 12', '555-0924', true, NOW());

-- =============================================================================
-- U14 GIRLS TEAMS (1 team)
-- =============================================================================

-- WCS Sharks (U14 Girls) - Replace [TEAM_ID_10] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID_10]', 'WCS Sharks Player 1', 1, '9th', '2010-01-15', 14, 'Sharks Parent 1', 'sharks1@email.com', '555-1001', 'Sharks Emergency 1', '555-1002', true, NOW()),
('[TEAM_ID_10]', 'WCS Sharks Player 2', 2, '9th', '2010-03-20', 14, 'Sharks Parent 2', 'sharks2@email.com', '555-1003', 'Sharks Emergency 2', '555-1004', true, NOW()),
('[TEAM_ID_10]', 'WCS Sharks Player 3', 3, '9th', '2010-06-10', 14, 'Sharks Parent 3', 'sharks3@email.com', '555-1005', 'Sharks Emergency 3', '555-1006', true, NOW()),
('[TEAM_ID_10]', 'WCS Sharks Player 4', 4, '9th', '2010-09-05', 14, 'Sharks Parent 4', 'sharks4@email.com', '555-1007', 'Sharks Emergency 4', '555-1008', true, NOW()),
('[TEAM_ID_10]', 'WCS Sharks Player 5', 5, '9th', '2010-12-12', 14, 'Sharks Parent 5', 'sharks5@email.com', '555-1009', 'Sharks Emergency 5', '555-1010', true, NOW()),
('[TEAM_ID_10]', 'WCS Sharks Player 6', 6, '9th', '2010-02-28', 14, 'Sharks Parent 6', 'sharks6@email.com', '555-1011', 'Sharks Emergency 6', '555-1012', true, NOW()),
('[TEAM_ID_10]', 'WCS Sharks Player 7', 7, '9th', '2010-04-15', 14, 'Sharks Parent 7', 'sharks7@email.com', '555-1013', 'Sharks Emergency 7', '555-1014', true, NOW()),
('[TEAM_ID_10]', 'WCS Sharks Player 8', 8, '9th', '2010-07-22', 14, 'Sharks Parent 8', 'sharks8@email.com', '555-1015', 'Sharks Emergency 8', '555-1016', true, NOW()),
('[TEAM_ID_10]', 'WCS Sharks Player 9', 9, '9th', '2010-10-08', 14, 'Sharks Parent 9', 'sharks9@email.com', '555-1017', 'Sharks Emergency 9', '555-1018', true, NOW()),
('[TEAM_ID_10]', 'WCS Sharks Player 10', 10, '9th', '2010-11-30', 14, 'Sharks Parent 10', 'sharks10@email.com', '555-1019', 'Sharks Emergency 10', '555-1020', true, NOW()),
('[TEAM_ID_10]', 'WCS Sharks Player 11', 11, '9th', '2010-05-18', 14, 'Sharks Parent 11', 'sharks11@email.com', '555-1021', 'Sharks Emergency 11', '555-1022', true, NOW()),
('[TEAM_ID_10]', 'WCS Sharks Player 12', 12, '9th', '2010-08-25', 14, 'Sharks Parent 12', 'sharks12@email.com', '555-1023', 'Sharks Emergency 12', '555-1024', true, NOW());

-- =============================================================================
-- U16 GIRLS TEAMS (6 teams)
-- =============================================================================

-- WCS Dupy (U16 Girls) - Replace [TEAM_ID_11] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID_11]', 'WCS Dupy Player 1', 1, '11th', '2008-01-15', 16, 'Dupy Parent 1', 'dupy1@email.com', '555-1101', 'Dupy Emergency 1', '555-1102', true, NOW()),
('[TEAM_ID_11]', 'WCS Dupy Player 2', 2, '11th', '2008-03-20', 16, 'Dupy Parent 2', 'dupy2@email.com', '555-1103', 'Dupy Emergency 2', '555-1104', true, NOW()),
('[TEAM_ID_11]', 'WCS Dupy Player 3', 3, '11th', '2008-06-10', 16, 'Dupy Parent 3', 'dupy3@email.com', '555-1105', 'Dupy Emergency 3', '555-1106', true, NOW()),
('[TEAM_ID_11]', 'WCS Dupy Player 4', 4, '11th', '2008-09-05', 16, 'Dupy Parent 4', 'dupy4@email.com', '555-1107', 'Dupy Emergency 4', '555-1108', true, NOW()),
('[TEAM_ID_11]', 'WCS Dupy Player 5', 5, '11th', '2008-12-12', 16, 'Dupy Parent 5', 'dupy5@email.com', '555-1109', 'Dupy Emergency 5', '555-1110', true, NOW()),
('[TEAM_ID_11]', 'WCS Dupy Player 6', 6, '11th', '2008-02-28', 16, 'Dupy Parent 6', 'dupy6@email.com', '555-1111', 'Dupy Emergency 6', '555-1112', true, NOW()),
('[TEAM_ID_11]', 'WCS Dupy Player 7', 7, '11th', '2008-04-15', 16, 'Dupy Parent 7', 'dupy7@email.com', '555-1113', 'Dupy Emergency 7', '555-1114', true, NOW()),
('[TEAM_ID_11]', 'WCS Dupy Player 8', 8, '11th', '2008-07-22', 16, 'Dupy Parent 8', 'dupy8@email.com', '555-1115', 'Dupy Emergency 8', '555-1116', true, NOW()),
('[TEAM_ID_11]', 'WCS Dupy Player 9', 9, '11th', '2008-10-08', 16, 'Dupy Parent 9', 'dupy9@email.com', '555-1117', 'Dupy Emergency 9', '555-1118', true, NOW()),
('[TEAM_ID_11]', 'WCS Dupy Player 10', 10, '11th', '2008-11-30', 16, 'Dupy Parent 10', 'dupy10@email.com', '555-1119', 'Dupy Emergency 10', '555-1120', true, NOW()),
('[TEAM_ID_11]', 'WCS Dupy Player 11', 11, '11th', '2008-05-18', 16, 'Dupy Parent 11', 'dupy11@email.com', '555-1121', 'Dupy Emergency 11', '555-1122', true, NOW()),
('[TEAM_ID_11]', 'WCS Dupy Player 12', 12, '11th', '2008-08-25', 16, 'Dupy Parent 12', 'dupy12@email.com', '555-1123', 'Dupy Emergency 12', '555-1124', true, NOW());

-- WCS Potter (U16 Girls) - Replace [TEAM_ID_12] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID_12]', 'WCS Potter Player 1', 1, '11th', '2008-01-15', 16, 'Potter Parent 1', 'potter1@email.com', '555-1201', 'Potter Emergency 1', '555-1202', true, NOW()),
('[TEAM_ID_12]', 'WCS Potter Player 2', 2, '11th', '2008-03-20', 16, 'Potter Parent 2', 'potter2@email.com', '555-1203', 'Potter Emergency 2', '555-1204', true, NOW()),
('[TEAM_ID_12]', 'WCS Potter Player 3', 3, '11th', '2008-06-10', 16, 'Potter Parent 3', 'potter3@email.com', '555-1205', 'Potter Emergency 3', '555-1206', true, NOW()),
('[TEAM_ID_12]', 'WCS Potter Player 4', 4, '11th', '2008-09-05', 16, 'Potter Parent 4', 'potter4@email.com', '555-1207', 'Potter Emergency 4', '555-1208', true, NOW()),
('[TEAM_ID_12]', 'WCS Potter Player 5', 5, '11th', '2008-12-12', 16, 'Potter Parent 5', 'potter5@email.com', '555-1209', 'Potter Emergency 5', '555-1210', true, NOW()),
('[TEAM_ID_12]', 'WCS Potter Player 6', 6, '11th', '2008-02-28', 16, 'Potter Parent 6', 'potter6@email.com', '555-1211', 'Potter Emergency 6', '555-1212', true, NOW()),
('[TEAM_ID_12]', 'WCS Potter Player 7', 7, '11th', '2008-04-15', 16, 'Potter Parent 7', 'potter7@email.com', '555-1213', 'Potter Emergency 7', '555-1214', true, NOW()),
('[TEAM_ID_12]', 'WCS Potter Player 8', 8, '11th', '2008-07-22', 16, 'Potter Parent 8', 'potter8@email.com', '555-1215', 'Potter Emergency 8', '555-1216', true, NOW()),
('[TEAM_ID_12]', 'WCS Potter Player 9', 9, '11th', '2008-10-08', 16, 'Potter Parent 9', 'potter9@email.com', '555-1217', 'Potter Emergency 9', '555-1218', true, NOW()),
('[TEAM_ID_12]', 'WCS Potter Player 10', 10, '11th', '2008-11-30', 16, 'Potter Parent 10', 'potter10@email.com', '555-1219', 'Potter Emergency 10', '555-1220', true, NOW()),
('[TEAM_ID_12]', 'WCS Potter Player 11', 11, '11th', '2008-05-18', 16, 'Potter Parent 11', 'potter11@email.com', '555-1221', 'Potter Emergency 11', '555-1222', true, NOW()),
('[TEAM_ID_12]', 'WCS Potter Player 12', 12, '11th', '2008-08-25', 16, 'Potter Parent 12', 'potter12@email.com', '555-1223', 'Potter Emergency 12', '555-1224', true, NOW());

-- WCS Red (U16 Girls) - Replace [TEAM_ID_13] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID_13]', 'WCS Red Player 1', 1, '11th', '2008-01-15', 16, 'Red Parent 1', 'red1@email.com', '555-1301', 'Red Emergency 1', '555-1302', true, NOW()),
('[TEAM_ID_13]', 'WCS Red Player 2', 2, '11th', '2008-03-20', 16, 'Red Parent 2', 'red2@email.com', '555-1303', 'Red Emergency 2', '555-1304', true, NOW()),
('[TEAM_ID_13]', 'WCS Red Player 3', 3, '11th', '2008-06-10', 16, 'Red Parent 3', 'red3@email.com', '555-1305', 'Red Emergency 3', '555-1306', true, NOW()),
('[TEAM_ID_13]', 'WCS Red Player 4', 4, '11th', '2008-09-05', 16, 'Red Parent 4', 'red4@email.com', '555-1307', 'Red Emergency 4', '555-1308', true, NOW()),
('[TEAM_ID_13]', 'WCS Red Player 5', 5, '11th', '2008-12-12', 16, 'Red Parent 5', 'red5@email.com', '555-1309', 'Red Emergency 5', '555-1310', true, NOW()),
('[TEAM_ID_13]', 'WCS Red Player 6', 6, '11th', '2008-02-28', 16, 'Red Parent 6', 'red6@email.com', '555-1311', 'Red Emergency 6', '555-1312', true, NOW()),
('[TEAM_ID_13]', 'WCS Red Player 7', 7, '11th', '2008-04-15', 16, 'Red Parent 7', 'red7@email.com', '555-1313', 'Red Emergency 7', '555-1314', true, NOW()),
('[TEAM_ID_13]', 'WCS Red Player 8', 8, '11th', '2008-07-22', 16, 'Red Parent 8', 'red8@email.com', '555-1315', 'Red Emergency 8', '555-1316', true, NOW()),
('[TEAM_ID_13]', 'WCS Red Player 9', 9, '11th', '2008-10-08', 16, 'Red Parent 9', 'red9@email.com', '555-1317', 'Red Emergency 9', '555-1318', true, NOW()),
('[TEAM_ID_13]', 'WCS Red Player 10', 10, '11th', '2008-11-30', 16, 'Red Parent 10', 'red10@email.com', '555-1319', 'Red Emergency 10', '555-1320', true, NOW()),
('[TEAM_ID_13]', 'WCS Red Player 11', 11, '11th', '2008-05-18', 16, 'Red Parent 11', 'red11@email.com', '555-1321', 'Red Emergency 11', '555-1322', true, NOW()),
('[TEAM_ID_13]', 'WCS Red Player 12', 12, '11th', '2008-08-25', 16, 'Red Parent 12', 'red12@email.com', '555-1323', 'Red Emergency 12', '555-1324', true, NOW());

-- WCS Swish (U16 Girls) - Replace [TEAM_ID_14] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID_14]', 'WCS Swish Player 1', 1, '11th', '2008-01-15', 16, 'Swish Parent 1', 'swish1@email.com', '555-1401', 'Swish Emergency 1', '555-1402', true, NOW()),
('[TEAM_ID_14]', 'WCS Swish Player 2', 2, '11th', '2008-03-20', 16, 'Swish Parent 2', 'swish2@email.com', '555-1403', 'Swish Emergency 2', '555-1404', true, NOW()),
('[TEAM_ID_14]', 'WCS Swish Player 3', 3, '11th', '2008-06-10', 16, 'Swish Parent 3', 'swish3@email.com', '555-1405', 'Swish Emergency 3', '555-1406', true, NOW()),
('[TEAM_ID_14]', 'WCS Swish Player 4', 4, '11th', '2008-09-05', 16, 'Swish Parent 4', 'swish4@email.com', '555-1407', 'Swish Emergency 4', '555-1408', true, NOW()),
('[TEAM_ID_14]', 'WCS Swish Player 5', 5, '11th', '2008-12-12', 16, 'Swish Parent 5', 'swish5@email.com', '555-1409', 'Swish Emergency 5', '555-1410', true, NOW()),
('[TEAM_ID_14]', 'WCS Swish Player 6', 6, '11th', '2008-02-28', 16, 'Swish Parent 6', 'swish6@email.com', '555-1411', 'Swish Emergency 6', '555-1412', true, NOW()),
('[TEAM_ID_14]', 'WCS Swish Player 7', 7, '11th', '2008-04-15', 16, 'Swish Parent 7', 'swish7@email.com', '555-1413', 'Swish Emergency 7', '555-1414', true, NOW()),
('[TEAM_ID_14]', 'WCS Swish Player 8', 8, '11th', '2008-07-22', 16, 'Swish Parent 8', 'swish8@email.com', '555-1415', 'Swish Emergency 8', '555-1416', true, NOW()),
('[TEAM_ID_14]', 'WCS Swish Player 9', 9, '11th', '2008-10-08', 16, 'Swish Parent 9', 'swish9@email.com', '555-1417', 'Swish Emergency 9', '555-1418', true, NOW()),
('[TEAM_ID_14]', 'WCS Swish Player 10', 10, '11th', '2008-11-30', 16, 'Swish Parent 10', 'swish10@email.com', '555-1419', 'Swish Emergency 10', '555-1420', true, NOW()),
('[TEAM_ID_14]', 'WCS Swish Player 11', 11, '11th', '2008-05-18', 16, 'Swish Parent 11', 'swish11@email.com', '555-1421', 'Swish Emergency 11', '555-1422', true, NOW()),
('[TEAM_ID_14]', 'WCS Swish Player 12', 12, '11th', '2008-08-25', 16, 'Swish Parent 12', 'swish12@email.com', '555-1423', 'Swish Emergency 12', '555-1424', true, NOW());

-- WCS Vipers (U16 Girls) - Replace [TEAM_ID_15] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID_15]', 'WCS Vipers Player 1', 1, '11th', '2008-01-15', 16, 'Vipers Parent 1', 'vipers1@email.com', '555-1501', 'Vipers Emergency 1', '555-1502', true, NOW()),
('[TEAM_ID_15]', 'WCS Vipers Player 2', 2, '11th', '2008-03-20', 16, 'Vipers Parent 2', 'vipers2@email.com', '555-1503', 'Vipers Emergency 2', '555-1504', true, NOW()),
('[TEAM_ID_15]', 'WCS Vipers Player 3', 3, '11th', '2008-06-10', 16, 'Vipers Parent 3', 'vipers3@email.com', '555-1505', 'Vipers Emergency 3', '555-1506', true, NOW()),
('[TEAM_ID_15]', 'WCS Vipers Player 4', 4, '11th', '2008-09-05', 16, 'Vipers Parent 4', 'vipers4@email.com', '555-1507', 'Vipers Emergency 4', '555-1508', true, NOW()),
('[TEAM_ID_15]', 'WCS Vipers Player 5', 5, '11th', '2008-12-12', 16, 'Vipers Parent 5', 'vipers5@email.com', '555-1509', 'Vipers Emergency 5', '555-1510', true, NOW()),
('[TEAM_ID_15]', 'WCS Vipers Player 6', 6, '11th', '2008-02-28', 16, 'Vipers Parent 6', 'vipers6@email.com', '555-1511', 'Vipers Emergency 6', '555-1512', true, NOW()),
('[TEAM_ID_15]', 'WCS Vipers Player 7', 7, '11th', '2008-04-15', 16, 'Vipers Parent 7', 'vipers7@email.com', '555-1513', 'Vipers Emergency 7', '555-1514', true, NOW()),
('[TEAM_ID_15]', 'WCS Vipers Player 8', 8, '11th', '2008-07-22', 16, 'Vipers Parent 8', 'vipers8@email.com', '555-1515', 'Vipers Emergency 8', '555-1516', true, NOW()),
('[TEAM_ID_15]', 'WCS Vipers Player 9', 9, '11th', '2008-10-08', 16, 'Vipers Parent 9', 'vipers9@email.com', '555-1517', 'Vipers Emergency 9', '555-1518', true, NOW()),
('[TEAM_ID_15]', 'WCS Vipers Player 10', 10, '11th', '2008-11-30', 16, 'Vipers Parent 10', 'vipers10@email.com', '555-1519', 'Vipers Emergency 10', '555-1520', true, NOW()),
('[TEAM_ID_15]', 'WCS Vipers Player 11', 11, '11th', '2008-05-18', 16, 'Vipers Parent 11', 'vipers11@email.com', '555-1521', 'Vipers Emergency 11', '555-1522', true, NOW()),
('[TEAM_ID_15]', 'WCS Vipers Player 12', 12, '11th', '2008-08-25', 16, 'Vipers Parent 12', 'vipers12@email.com', '555-1523', 'Vipers Emergency 12', '555-1524', true, NOW());

-- WCS Williams (U16 Girls) - Replace [TEAM_ID_16] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID_16]', 'WCS Williams Player 1', 1, '11th', '2008-01-15', 16, 'Williams Parent 1', 'williams1@email.com', '555-1601', 'Williams Emergency 1', '555-1602', true, NOW()),
('[TEAM_ID_16]', 'WCS Williams Player 2', 2, '11th', '2008-03-20', 16, 'Williams Parent 2', 'williams2@email.com', '555-1603', 'Williams Emergency 2', '555-1604', true, NOW()),
('[TEAM_ID_16]', 'WCS Williams Player 3', 3, '11th', '2008-06-10', 16, 'Williams Parent 3', 'williams3@email.com', '555-1605', 'Williams Emergency 3', '555-1606', true, NOW()),
('[TEAM_ID_16]', 'WCS Williams Player 4', 4, '11th', '2008-09-05', 16, 'Williams Parent 4', 'williams4@email.com', '555-1607', 'Williams Emergency 4', '555-1608', true, NOW()),
('[TEAM_ID_16]', 'WCS Williams Player 5', 5, '11th', '2008-12-12', 16, 'Williams Parent 5', 'williams5@email.com', '555-1609', 'Williams Emergency 5', '555-1610', true, NOW()),
('[TEAM_ID_16]', 'WCS Williams Player 6', 6, '11th', '2008-02-28', 16, 'Williams Parent 6', 'williams6@email.com', '555-1611', 'Williams Emergency 6', '555-1612', true, NOW()),
('[TEAM_ID_16]', 'WCS Williams Player 7', 7, '11th', '2008-04-15', 16, 'Williams Parent 7', 'williams7@email.com', '555-1613', 'Williams Emergency 7', '555-1614', true, NOW()),
('[TEAM_ID_16]', 'WCS Williams Player 8', 8, '11th', '2008-07-22', 16, 'Williams Parent 8', 'williams8@email.com', '555-1615', 'Williams Emergency 8', '555-1616', true, NOW()),
('[TEAM_ID_16]', 'WCS Williams Player 9', 9, '11th', '2008-10-08', 16, 'Williams Parent 9', 'williams9@email.com', '555-1617', 'Williams Emergency 9', '555-1618', true, NOW()),
('[TEAM_ID_16]', 'WCS Williams Player 10', 10, '11th', '2008-11-30', 16, 'Williams Parent 10', 'williams10@email.com', '555-1619', 'Williams Emergency 10', '555-1620', true, NOW()),
('[TEAM_ID_16]', 'WCS Williams Player 11', 11, '11th', '2008-05-18', 16, 'Williams Parent 11', 'williams11@email.com', '555-1621', 'Williams Emergency 11', '555-1622', true, NOW()),
('[TEAM_ID_16]', 'WCS Williams Player 12', 12, '11th', '2008-08-25', 16, 'Williams Parent 12', 'williams12@email.com', '555-1623', 'Williams Emergency 12', '555-1624', true, NOW());

-- =============================================================================
-- U18 BOYS TEAMS (1 team)
-- =============================================================================

-- WCS Legends (U18 Boys) - Replace [TEAM_ID_17] with actual team ID
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('[TEAM_ID_17]', 'WCS Legends Player 1', 1, '12th', '2006-01-15', 18, 'Legends Parent 1', 'legends1@email.com', '555-1701', 'Legends Emergency 1', '555-1702', true, NOW()),
('[TEAM_ID_17]', 'WCS Legends Player 2', 2, '12th', '2006-03-20', 18, 'Legends Parent 2', 'legends2@email.com', '555-1703', 'Legends Emergency 2', '555-1704', true, NOW()),
('[TEAM_ID_17]', 'WCS Legends Player 3', 3, '12th', '2006-06-10', 18, 'Legends Parent 3', 'legends3@email.com', '555-1705', 'Legends Emergency 3', '555-1706', true, NOW()),
('[TEAM_ID_17]', 'WCS Legends Player 4', 4, '12th', '2006-09-05', 18, 'Legends Parent 4', 'legends4@email.com', '555-1707', 'Legends Emergency 4', '555-1708', true, NOW()),
('[TEAM_ID_17]', 'WCS Legends Player 5', 5, '12th', '2006-12-12', 18, 'Legends Parent 5', 'legends5@email.com', '555-1709', 'Legends Emergency 5', '555-1710', true, NOW()),
('[TEAM_ID_17]', 'WCS Legends Player 6', 6, '12th', '2006-02-28', 18, 'Legends Parent 6', 'legends6@email.com', '555-1711', 'Legends Emergency 6', '555-1712', true, NOW()),
('[TEAM_ID_17]', 'WCS Legends Player 7', 7, '12th', '2006-04-15', 18, 'Legends Parent 7', 'legends7@email.com', '555-1713', 'Legends Emergency 7', '555-1714', true, NOW()),
('[TEAM_ID_17]', 'WCS Legends Player 8', 8, '12th', '2006-07-22', 18, 'Legends Parent 8', 'legends8@email.com', '555-1715', 'Legends Emergency 8', '555-1716', true, NOW()),
('[TEAM_ID_17]', 'WCS Legends Player 9', 9, '12th', '2006-10-08', 18, 'Legends Parent 9', 'legends9@email.com', '555-1717', 'Legends Emergency 9', '555-1718', true, NOW()),
('[TEAM_ID_17]', 'WCS Legends Player 10', 10, '12th', '2006-11-30', 18, 'Legends Parent 10', 'legends10@email.com', '555-1719', 'Legends Emergency 10', '555-1720', true, NOW()),
('[TEAM_ID_17]', 'WCS Legends Player 11', 11, '12th', '2006-05-18', 18, 'Legends Parent 11', 'legends11@email.com', '555-1721', 'Legends Emergency 11', '555-1722', true, NOW()),
('[TEAM_ID_17]', 'WCS Legends Player 12', 12, '12th', '2006-08-25', 18, 'Legends Parent 12', 'legends12@email.com', '555-1723', 'Legends Emergency 12', '555-1724', true, NOW());

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- After running all the INSERT statements, verify the data with these queries:

-- 1. Check player count per team:
-- SELECT t.name, t.age_group, t.gender, COUNT(p.id) as player_count 
-- FROM teams t 
-- LEFT JOIN players p ON t.id = p.team_id 
-- GROUP BY t.id, t.name, t.age_group, t.gender 
-- ORDER BY t.age_group, t.gender, t.name;

-- 2. Check total player count:
-- SELECT COUNT(*) as total_players FROM players;

-- 3. Check age distribution:
-- SELECT age, COUNT(*) as player_count 
-- FROM players 
-- GROUP BY age 
-- ORDER BY age;

-- 4. Check grade distribution:
-- SELECT grade, COUNT(*) as player_count 
-- FROM players 
-- GROUP BY grade 
-- ORDER BY grade;
