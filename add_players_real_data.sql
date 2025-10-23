-- Complete SQL script to add 12 players to each of the 18 teams with realistic data
-- Total: 216 players (12 players × 18 teams)
-- Using actual team IDs from the database

-- =============================================================================
-- U10 BOYS TEAMS (3 teams)
-- =============================================================================

-- Test (U10 Boys) - Team ID: 53e16df0-eeba-450f-a75a-20003e85d647
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('53e16df0-eeba-450f-a75a-20003e85d647', 'Ethan Rodriguez', 1, '5th', '2015-03-15', 9, 'Maria Rodriguez', 'maria.rodriguez@email.com', '555-0101', 'Carlos Rodriguez', '555-0102', true, NOW()),
('53e16df0-eeba-450f-a75a-20003e85d647', 'Liam Thompson', 2, '5th', '2015-07-22', 9, 'Sarah Thompson', 'sarah.thompson@email.com', '555-0103', 'Michael Thompson', '555-0104', true, NOW()),
('53e16df0-eeba-450f-a75a-20003e85d647', 'Noah Johnson', 3, '5th', '2015-01-10', 9, 'Jennifer Johnson', 'jennifer.johnson@email.com', '555-0105', 'David Johnson', '555-0106', true, NOW()),
('53e16df0-eeba-450f-a75a-20003e85d647', 'Oliver Williams', 4, '5th', '2015-11-08', 9, 'Lisa Williams', 'lisa.williams@email.com', '555-0107', 'Robert Williams', '555-0108', true, NOW()),
('53e16df0-eeba-450f-a75a-20003e85d647', 'William Brown', 5, '5th', '2015-05-14', 9, 'Amanda Brown', 'amanda.brown@email.com', '555-0109', 'James Brown', '555-0110', true, NOW()),
('53e16df0-eeba-450f-a75a-20003e85d647', 'James Davis', 6, '5th', '2015-09-30', 9, 'Michelle Davis', 'michelle.davis@email.com', '555-0111', 'Christopher Davis', '555-0112', true, NOW()),
('53e16df0-eeba-450f-a75a-20003e85d647', 'Benjamin Miller', 7, '5th', '2015-12-03', 9, 'Ashley Miller', 'ashley.miller@email.com', '555-0113', 'Daniel Miller', '555-0114', true, NOW()),
('53e16df0-eeba-450f-a75a-20003e85d647', 'Lucas Wilson', 8, '5th', '2015-04-18', 9, 'Jessica Wilson', 'jessica.wilson@email.com', '555-0115', 'Matthew Wilson', '555-0116', true, NOW()),
('53e16df0-eeba-450f-a75a-20003e85d647', 'Henry Moore', 9, '5th', '2015-08-25', 9, 'Nicole Moore', 'nicole.moore@email.com', '555-0117', 'Andrew Moore', '555-0118', true, NOW()),
('53e16df0-eeba-450f-a75a-20003e85d647', 'Alexander Taylor', 10, '5th', '2015-06-12', 9, 'Stephanie Taylor', 'stephanie.taylor@email.com', '555-0119', 'Joshua Taylor', '555-0120', true, NOW()),
('53e16df0-eeba-450f-a75a-20003e85d647', 'Mason Anderson', 11, '5th', '2015-10-07', 9, 'Rachel Anderson', 'rachel.anderson@email.com', '555-0121', 'Ryan Anderson', '555-0122', true, NOW()),
('53e16df0-eeba-450f-a75a-20003e85d647', 'Michael Thomas', 12, '5th', '2015-02-28', 9, 'Kimberly Thomas', 'kimberly.thomas@email.com', '555-0123', 'Kevin Thomas', '555-0124', true, NOW());

-- Test Team (U10 Boys) - Team ID: 4ea47bd8-5ea5-46ab-b517-1123bed8eddb
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('4ea47bd8-5ea5-46ab-b517-1123bed8eddb', 'Jackson Martinez', 1, '5th', '2015-04-20', 9, 'Patricia Martinez', 'patricia.martinez@email.com', '555-0201', 'Jose Martinez', '555-0202', true, NOW()),
('4ea47bd8-5ea5-46ab-b517-1123bed8eddb', 'Sebastian Garcia', 2, '5th', '2015-08-15', 9, 'Sandra Garcia', 'sandra.garcia@email.com', '555-0203', 'Antonio Garcia', '555-0204', true, NOW()),
('4ea47bd8-5ea5-46ab-b517-1123bed8eddb', 'Aiden Lopez', 3, '5th', '2015-12-01', 9, 'Cynthia Lopez', 'cynthia.lopez@email.com', '555-0205', 'Rafael Lopez', '555-0206', true, NOW()),
('4ea47bd8-5ea5-46ab-b517-1123bed8eddb', 'Carter Gonzalez', 4, '5th', '2015-06-28', 9, 'Angela Gonzalez', 'angela.gonzalez@email.com', '555-0207', 'Fernando Gonzalez', '555-0208', true, NOW()),
('4ea47bd8-5ea5-46ab-b517-1123bed8eddb', 'Wyatt Hernandez', 5, '5th', '2015-09-14', 9, 'Monica Hernandez', 'monica.hernandez@email.com', '555-0209', 'Ricardo Hernandez', '555-0210', true, NOW()),
('4ea47bd8-5ea5-46ab-b517-1123bed8eddb', 'Jayden King', 6, '5th', '2015-01-25', 9, 'Veronica King', 'veronica.king@email.com', '555-0211', 'Eduardo King', '555-0212', true, NOW()),
('4ea47bd8-5ea5-46ab-b517-1123bed8eddb', 'Owen Wright', 7, '5th', '2015-11-19', 9, 'Gabriela Wright', 'gabriela.wright@email.com', '555-0213', 'Hector Wright', '555-0214', true, NOW()),
('4ea47bd8-5ea5-46ab-b517-1123bed8eddb', 'Luke Adams', 8, '5th', '2015-03-07', 9, 'Isabel Adams', 'isabel.adams@email.com', '555-0215', 'Manuel Adams', '555-0216', true, NOW()),
('4ea47bd8-5ea5-46ab-b517-1123bed8eddb', 'Grayson Nelson', 9, '5th', '2015-07-04', 9, 'Carmen Nelson', 'carmen.nelson@email.com', '555-0217', 'Roberto Nelson', '555-0218', true, NOW()),
('4ea47bd8-5ea5-46ab-b517-1123bed8eddb', 'Levi Carter', 10, '5th', '2015-10-12', 9, 'Adriana Carter', 'adriana.carter@email.com', '555-0219', 'Alberto Carter', '555-0220', true, NOW()),
('4ea47bd8-5ea5-46ab-b517-1123bed8eddb', 'Mateo Mitchell', 11, '5th', '2015-05-26', 9, 'Elena Mitchell', 'elena.mitchell@email.com', '555-0221', 'Carlos Mitchell', '555-0222', true, NOW()),
('4ea47bd8-5ea5-46ab-b517-1123bed8eddb', 'Ryan Perez', 12, '5th', '2015-08-31', 9, 'Sofia Perez', 'sofia.perez@email.com', '555-0223', 'Luis Perez', '555-0224', true, NOW());

-- WCS Blue (U10 Boys) - Team ID: 5599a52a-7927-4868-b630-48d2fa92b5cb
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('5599a52a-7927-4868-b630-48d2fa92b5cb', 'Connor Roberts', 1, '5th', '2015-02-14', 9, 'Valerie Roberts', 'valerie.roberts@email.com', '555-0301', 'Gregory Roberts', '555-0302', true, NOW()),
('5599a52a-7927-4868-b630-48d2fa92b5cb', 'Hunter Phillips', 2, '5th', '2015-06-09', 9, 'Diana Phillips', 'diana.phillips@email.com', '555-0303', 'Wayne Phillips', '555-0304', true, NOW()),
('5599a52a-7927-4868-b630-48d2fa92b5cb', 'Eli Campbell', 3, '5th', '2015-10-16', 9, 'Brenda Campbell', 'brenda.campbell@email.com', '555-0305', 'Philip Campbell', '555-0306', true, NOW()),
('5599a52a-7927-4868-b630-48d2fa92b5cb', 'Nolan Parker', 4, '5th', '2015-04-03', 9, 'Deborah Parker', 'deborah.parker@email.com', '555-0307', 'Arthur Parker', '555-0308', true, NOW()),
('5599a52a-7927-4868-b630-48d2fa92b5cb', 'Christian Evans', 5, '5th', '2015-08-27', 9, 'Sharon Evans', 'sharon.evans@email.com', '555-0309', 'Peter Evans', '555-0310', true, NOW()),
('5599a52a-7927-4868-b630-48d2fa92b5cb', 'Aaron Edwards', 6, '5th', '2015-12-13', 9, 'Donna Edwards', 'donna.edwards@email.com', '555-0311', 'Harold Edwards', '555-0312', true, NOW()),
('5599a52a-7927-4868-b630-48d2fa92b5cb', 'Landon Collins', 7, '5th', '2015-01-18', 9, 'Carol Collins', 'carol.collins@email.com', '555-0313', 'Douglas Collins', '555-0314', true, NOW()),
('5599a52a-7927-4868-b630-48d2fa92b5cb', 'Adrian Stewart', 8, '5th', '2015-05-05', 9, 'Ruth Stewart', 'ruth.stewart@email.com', '555-0315', 'Raymond Stewart', '555-0316', true, NOW()),
('5599a52a-7927-4868-b630-48d2fa92b5cb', 'Jonathan Sanchez', 9, '5th', '2015-09-22', 9, 'Janet Sanchez', 'janet.sanchez@email.com', '555-0317', 'Louis Sanchez', '555-0318', true, NOW()),
('5599a52a-7927-4868-b630-48d2fa92b5cb', 'Nathan Morris', 10, '5th', '2015-07-11', 9, 'Frances Morris', 'frances.morris@email.com', '555-0319', 'Eugene Morris', '555-0320', true, NOW()),
('5599a52a-7927-4868-b630-48d2fa92b5cb', 'Isaac Rogers', 11, '5th', '2015-11-06', 9, 'Christine Rogers', 'christine.rogers@email.com', '555-0321', 'Albert Rogers', '555-0322', true, NOW()),
('5599a52a-7927-4868-b630-48d2fa92b5cb', 'Charles Reed', 12, '5th', '2015-03-29', 9, 'Samantha Reed', 'samantha.reed@email.com', '555-0323', 'Victor Reed', '555-0324', true, NOW());

-- WCS Fake (U10 Boys) - Team ID: a4c93840-134e-49f4-9602-f597a87c6e15
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('a4c93840-134e-49f4-9602-f597a87c6e15', 'Thomas Cook', 1, '5th', '2015-06-17', 9, 'Catherine Cook', 'catherine.cook@email.com', '555-0401', 'Ralph Cook', '555-0402', true, NOW()),
('a4c93840-134e-49f4-9602-f597a87c6e15', 'Jeremy Morgan', 2, '5th', '2015-10-04', 9, 'Marie Morgan', 'marie.morgan@email.com', '555-0403', 'Roy Morgan', '555-0404', true, NOW()),
('a4c93840-134e-49f4-9602-f597a87c6e15', 'Kevin Bell', 3, '5th', '2015-02-21', 9, 'Heather Bell', 'heather.bell@email.com', '555-0405', 'Roger Bell', '555-0406', true, NOW()),
('a4c93840-134e-49f4-9602-f597a87c6e15', 'Brian Murphy', 4, '5th', '2015-08-08', 9, 'Diane Murphy', 'diane.murphy@email.com', '555-0407', 'Gerald Murphy', '555-0408', true, NOW()),
('a4c93840-134e-49f4-9602-f597a87c6e15', 'Jacob Bailey', 5, '5th', '2015-12-25', 9, 'Alice Bailey', 'alice.bailey@email.com', '555-0409', 'Sean Bailey', '555-0410', true, NOW()),
('a4c93840-134e-49f4-9602-f597a87c6e15', 'Mason Rivera', 6, '5th', '2015-04-12', 9, 'Julie Rivera', 'julie.rivera@email.com', '555-0411', 'Lawrence Rivera', '555-0412', true, NOW()),
('a4c93840-134e-49f4-9602-f597a87c6e15', 'Ethan Cooper', 7, '5th', '2015-08-29', 9, 'Grace Cooper', 'grace.cooper@email.com', '555-0413', 'Nicholas Cooper', '555-0414', true, NOW()),
('a4c93840-134e-49f4-9602-f597a87c6e15', 'Noah Richardson', 8, '5th', '2015-01-15', 9, 'Victoria Richardson', 'victoria.richardson@email.com', '555-0415', 'Keith Richardson', '555-0416', true, NOW()),
('a4c93840-134e-49f4-9602-f597a87c6e15', 'Liam Cox', 9, '5th', '2015-05-02', 9, 'Sara Cox', 'sara.cox@email.com', '555-0417', 'Juan Cox', '555-0418', true, NOW()),
('a4c93840-134e-49f4-9602-f597a87c6e15', 'William Ward', 10, '5th', '2015-09-19', 9, 'Nancy Ward', 'nancy.ward@email.com', '555-0419', 'Joe Ward', '555-0420', true, NOW()),
('a4c93840-134e-49f4-9602-f597a87c6e15', 'James Torres', 11, '5th', '2015-07-06', 9, 'Betty Torres', 'betty.torres@email.com', '555-0421', 'Terry Torres', '555-0422', true, NOW()),
('a4c93840-134e-49f4-9602-f597a87c6e15', 'Benjamin Peterson', 12, '5th', '2015-11-23', 9, 'Helen Peterson', 'helen.peterson@email.com', '555-0423', 'Jerry Peterson', '555-0424', true, NOW());

-- =============================================================================
-- U12 BOYS TEAMS (3 teams)
-- =============================================================================

-- WCS Errors (U12 Boys) - Team ID: 518d5875-8d21-48c0-8afe-e7f368a8aa81
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('518d5875-8d21-48c0-8afe-e7f368a8aa81', 'Alexander Gray', 1, '7th', '2012-03-15', 12, 'Dorothy Gray', 'dorothy.gray@email.com', '555-0501', 'Ronald Gray', '555-0502', true, NOW()),
('518d5875-8d21-48c0-8afe-e7f368a8aa81', 'Michael Ramirez', 2, '7th', '2012-07-22', 12, 'Shirley Ramirez', 'shirley.ramirez@email.com', '555-0503', 'Timothy Ramirez', '555-0504', true, NOW()),
('518d5875-8d21-48c0-8afe-e7f368a8aa81', 'Daniel James', 3, '7th', '2012-01-10', 12, 'Joyce James', 'joyce.james@email.com', '555-0505', 'Jason James', '555-0506', true, NOW()),
('518d5875-8d21-48c0-8afe-e7f368a8aa81', 'Matthew Watson', 4, '7th', '2012-11-08', 12, 'Virginia Watson', 'virginia.watson@email.com', '555-0507', 'Jeffrey Watson', '555-0508', true, NOW()),
('518d5875-8d21-48c0-8afe-e7f368a8aa81', 'Anthony Brooks', 5, '7th', '2012-05-14', 12, 'Beverly Brooks', 'beverly.brooks@email.com', '555-0509', 'Ryan Brooks', '555-0510', true, NOW()),
('518d5875-8d21-48c0-8afe-e7f368a8aa81', 'Mark Kelly', 6, '7th', '2012-09-30', 12, 'Evelyn Kelly', 'evelyn.kelly@email.com', '555-0511', 'Jacob Kelly', '555-0512', true, NOW()),
('518d5875-8d21-48c0-8afe-e7f368a8aa81', 'Donald Sanders', 7, '7th', '2012-12-03', 12, 'Phyllis Sanders', 'phyllis.sanders@email.com', '555-0513', 'Gary Sanders', '555-0514', true, NOW()),
('518d5875-8d21-48c0-8afe-e7f368a8aa81', 'Steven Price', 8, '7th', '2012-04-18', 12, 'Lori Price', 'lori.price@email.com', '555-0515', 'Nicholas Price', '555-0516', true, NOW()),
('518d5875-8d21-48c0-8afe-e7f368a8aa81', 'Paul Bennett', 9, '7th', '2012-08-25', 12, 'Robin Bennett', 'robin.bennett@email.com', '555-0517', 'Eric Bennett', '555-0518', true, NOW()),
('518d5875-8d21-48c0-8afe-e7f368a8aa81', 'Andrew Wood', 10, '7th', '2012-06-12', 12, 'Rebecca Wood', 'rebecca.wood@email.com', '555-0519', 'Stephen Wood', '555-0520', true, NOW()),
('518d5875-8d21-48c0-8afe-e7f368a8aa81', 'Joshua Barnes', 11, '7th', '2012-10-07', 12, 'Carolyn Barnes', 'carolyn.barnes@email.com', '555-0521', 'Andrew Barnes', '555-0522', true, NOW()),
('518d5875-8d21-48c0-8afe-e7f368a8aa81', 'Kenneth Ross', 12, '7th', '2012-02-28', 12, 'Janet Ross', 'janet.ross@email.com', '555-0523', 'Patrick Ross', '555-0524', true, NOW());

-- WCS Thunder (U12 Boys) - Team ID: e067bb7f-d8bd-43b4-8f87-31339d59b660
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('e067bb7f-d8bd-43b4-8f87-31339d59b660', 'Kevin Henderson', 1, '7th', '2012-04-20', 12, 'Catherine Henderson', 'catherine.henderson@email.com', '555-0601', 'Jack Henderson', '555-0602', true, NOW()),
('e067bb7f-d8bd-43b4-8f87-31339d59b660', 'Brian Coleman', 2, '7th', '2012-08-15', 12, 'Frances Coleman', 'frances.coleman@email.com', '555-0603', 'Dennis Coleman', '555-0604', true, NOW()),
('e067bb7f-d8bd-43b4-8f87-31339d59b660', 'George Jenkins', 3, '7th', '2012-12-01', 12, 'Christine Jenkins', 'christine.jenkins@email.com', '555-0605', 'Jerry Jenkins', '555-0606', true, NOW()),
('e067bb7f-d8bd-43b4-8f87-31339d59b660', 'Timothy Perry', 4, '7th', '2012-06-28', 12, 'Sandra Perry', 'sandra.perry@email.com', '555-0607', 'Raymond Perry', '555-0608', true, NOW()),
('e067bb7f-d8bd-43b4-8f87-31339d59b660', 'Ronald Powell', 5, '7th', '2012-09-14', 12, 'Deborah Powell', 'deborah.powell@email.com', '555-0609', 'Alexander Powell', '555-0610', true, NOW()),
('e067bb7f-d8bd-43b4-8f87-31339d59b660', 'Jason Long', 6, '7th', '2012-01-25', 12, 'Rachel Long', 'rachel.long@email.com', '555-0611', 'Patrick Long', '555-0612', true, NOW()),
('e067bb7f-d8bd-43b4-8f87-31339d59b660', 'Edward Patterson', 7, '7th', '2012-11-19', 12, 'Carolyn Patterson', 'carolyn.patterson@email.com', '555-0613', 'Frank Patterson', '555-0614', true, NOW()),
('e067bb7f-d8bd-43b4-8f87-31339d59b660', 'Jeffrey Hughes', 8, '7th', '2012-03-07', 12, 'Janet Hughes', 'janet.hughes@email.com', '555-0615', 'Scott Hughes', '555-0616', true, NOW()),
('e067bb7f-d8bd-43b4-8f87-31339d59b660', 'Ryan Flores', 9, '7th', '2012-07-04', 12, 'Virginia Flores', 'virginia.flores@email.com', '555-0617', 'Sean Flores', '555-0618', true, NOW()),
('e067bb7f-d8bd-43b4-8f87-31339d59b660', 'Jacob Washington', 10, '7th', '2012-10-12', 12, 'Maria Washington', 'maria.washington@email.com', '555-0619', 'Gregory Washington', '555-0620', true, NOW()),
('e067bb7f-d8bd-43b4-8f87-31339d59b660', 'Gary Butler', 11, '7th', '2012-05-26', 12, 'Linda Butler', 'linda.butler@email.com', '555-0621', 'Roger Butler', '555-0622', true, NOW()),
('e067bb7f-d8bd-43b4-8f87-31339d59b660', 'Nicholas Simmons', 12, '7th', '2012-08-31', 12, 'Susan Simmons', 'susan.simmons@email.com', '555-0623', 'Eugene Simmons', '555-0624', true, NOW());

-- WCS Warriors (U12 Boys) - Team ID: 30dea75d-61ef-4ce9-a74c-d359b9fbbe78
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('30dea75d-61ef-4ce9-a74c-d359b9fbbe78', 'Eric Foster', 1, '7th', '2012-02-14', 12, 'Barbara Foster', 'barbara.foster@email.com', '555-0701', 'Jonathan Foster', '555-0702', true, NOW()),
('30dea75d-61ef-4ce9-a74c-d359b9fbbe78', 'Jonathan Gonzales', 2, '7th', '2012-06-09', 12, 'Elizabeth Gonzales', 'elizabeth.gonzales@email.com', '555-0703', 'Stephen Gonzales', '555-0704', true, NOW()),
('30dea75d-61ef-4ce9-a74c-d359b9fbbe78', 'Stephen Bryant', 3, '7th', '2012-10-16', 12, 'Jennifer Bryant', 'jennifer.bryant@email.com', '555-0705', 'Andrew Bryant', '555-0706', true, NOW()),
('30dea75d-61ef-4ce9-a74c-d359b9fbbe78', 'Andrew Alexander', 4, '7th', '2012-04-03', 12, 'Linda Alexander', 'linda.alexander@email.com', '555-0707', 'Joshua Alexander', '555-0708', true, NOW()),
('30dea75d-61ef-4ce9-a74c-d359b9fbbe78', 'Joshua Russell', 5, '7th', '2012-08-27', 12, 'Patricia Russell', 'patricia.russell@email.com', '555-0709', 'Kenneth Russell', '555-0710', true, NOW()),
('30dea75d-61ef-4ce9-a74c-d359b9fbbe78', 'Kenneth Griffin', 6, '7th', '2012-12-13', 12, 'Betty Griffin', 'betty.griffin@email.com', '555-0711', 'Kevin Griffin', '555-0712', true, NOW()),
('30dea75d-61ef-4ce9-a74c-d359b9fbbe78', 'Kevin Diaz', 7, '7th', '2012-01-18', 12, 'Helen Diaz', 'helen.diaz@email.com', '555-0713', 'Brian Diaz', '555-0714', true, NOW()),
('30dea75d-61ef-4ce9-a74c-d359b9fbbe78', 'Brian Hayes', 8, '7th', '2012-05-05', 12, 'Sandra Hayes', 'sandra.hayes@email.com', '555-0715', 'George Hayes', '555-0716', true, NOW()),
('30dea75d-61ef-4ce9-a74c-d359b9fbbe78', 'George Myers', 9, '7th', '2012-09-22', 12, 'Donna Myers', 'donna.myers@email.com', '555-0717', 'Edward Myers', '555-0718', true, NOW()),
('30dea75d-61ef-4ce9-a74c-d359b9fbbe78', 'Edward Ford', 10, '7th', '2012-07-11', 12, 'Carol Ford', 'carol.ford@email.com', '555-0719', 'Ronald Ford', '555-0720', true, NOW()),
('30dea75d-61ef-4ce9-a74c-d359b9fbbe78', 'Ronald Hamilton', 11, '7th', '2012-11-06', 12, 'Ruth Hamilton', 'ruth.hamilton@email.com', '555-0721', 'Timothy Hamilton', '555-0722', true, NOW()),
('30dea75d-61ef-4ce9-a74c-d359b9fbbe78', 'Timothy Graham', 12, '7th', '2012-03-29', 12, 'Sharon Graham', 'sharon.graham@email.com', '555-0723', 'Jason Graham', '555-0724', true, NOW());

-- =============================================================================
-- U12 GIRLS TEAMS (1 team)
-- =============================================================================

-- WCS Eagles Elite (U12 Girls) - Team ID: 95c83e18-572a-45cf-b7e5-eb009921a3ae
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('95c83e18-572a-45cf-b7e5-eb009921a3ae', 'Emma Sullivan', 1, '7th', '2012-03-15', 12, 'Michelle Sullivan', 'michelle.sullivan@email.com', '555-0801', 'Robert Sullivan', '555-0802', true, NOW()),
('95c83e18-572a-45cf-b7e5-eb009921a3ae', 'Olivia Wallace', 2, '7th', '2012-07-22', 12, 'Laura Wallace', 'laura.wallace@email.com', '555-0803', 'Michael Wallace', '555-0804', true, NOW()),
('95c83e18-572a-45cf-b7e5-eb009921a3ae', 'Ava Woods', 3, '7th', '2012-01-10', 12, 'Sarah Woods', 'sarah.woods@email.com', '555-0805', 'William Woods', '555-0806', true, NOW()),
('95c83e18-572a-45cf-b7e5-eb009921a3ae', 'Isabella Cole', 4, '7th', '2012-11-08', 12, 'Karen Cole', 'karen.cole@email.com', '555-0807', 'David Cole', '555-0808', true, NOW()),
('95c83e18-572a-45cf-b7e5-eb009921a3ae', 'Sophia West', 5, '7th', '2012-05-14', 12, 'Nancy West', 'nancy.west@email.com', '555-0809', 'Richard West', '555-0810', true, NOW()),
('95c83e18-572a-45cf-b7e5-eb009921a3ae', 'Charlotte Jordan', 6, '7th', '2012-09-30', 12, 'Lisa Jordan', 'lisa.jordan@email.com', '555-0811', 'Joseph Jordan', '555-0812', true, NOW()),
('95c83e18-572a-45cf-b7e5-eb009921a3ae', 'Amelia Owens', 7, '7th', '2012-12-03', 12, 'Betty Owens', 'betty.owens@email.com', '555-0813', 'Thomas Owens', '555-0814', true, NOW()),
('95c83e18-572a-45cf-b7e5-eb009921a3ae', 'Mia Reynolds', 8, '7th', '2012-04-18', 12, 'Helen Reynolds', 'helen.reynolds@email.com', '555-0815', 'Christopher Reynolds', '555-0816', true, NOW()),
('95c83e18-572a-45cf-b7e5-eb009921a3ae', 'Harper Fisher', 9, '7th', '2012-08-25', 12, 'Sandra Fisher', 'sandra.fisher@email.com', '555-0817', 'Daniel Fisher', '555-0818', true, NOW()),
('95c83e18-572a-45cf-b7e5-eb009921a3ae', 'Evelyn Ellis', 10, '7th', '2012-06-12', 12, 'Donna Ellis', 'donna.ellis@email.com', '555-0819', 'Paul Ellis', '555-0820', true, NOW()),
('95c83e18-572a-45cf-b7e5-eb009921a3ae', 'Abigail Harrison', 11, '7th', '2012-10-07', 12, 'Carol Harrison', 'carol.harrison@email.com', '555-0821', 'Mark Harrison', '555-0822', true, NOW()),
('95c83e18-572a-45cf-b7e5-eb009921a3ae', 'Emily Gibson', 12, '7th', '2012-02-28', 12, 'Ruth Gibson', 'ruth.gibson@email.com', '555-0823', 'Donald Gibson', '555-0824', true, NOW());

-- =============================================================================
-- U14 BOYS TEAMS (2 teams)
-- =============================================================================

-- WCS Falcons (U14 Boys) - Team ID: 07718169-5a0f-47e4-84da-b423ad06de23
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('07718169-5a0f-47e4-84da-b423ad06de23', 'Lucas Mcdonald', 1, '9th', '2010-03-15', 14, 'Sharon Mcdonald', 'sharon.mcdonald@email.com', '555-0901', 'Steven Mcdonald', '555-0902', true, NOW()),
('07718169-5a0f-47e4-84da-b423ad06de23', 'Henry Cruz', 2, '9th', '2010-07-22', 14, 'Michelle Cruz', 'michelle.cruz@email.com', '555-0903', 'Paul Cruz', '555-0904', true, NOW()),
('07718169-5a0f-47e4-84da-b423ad06de23', 'Alexander Marshall', 3, '9th', '2010-01-10', 14, 'Laura Marshall', 'laura.marshall@email.com', '555-0905', 'Andrew Marshall', '555-0906', true, NOW()),
('07718169-5a0f-47e4-84da-b423ad06de23', 'Mason Ortiz', 4, '9th', '2010-11-08', 14, 'Sarah Ortiz', 'sarah.ortiz@email.com', '555-0907', 'Joshua Ortiz', '555-0908', true, NOW()),
('07718169-5a0f-47e4-84da-b423ad06de23', 'Michael Gomez', 5, '9th', '2010-05-14', 14, 'Karen Gomez', 'karen.gomez@email.com', '555-0909', 'Kenneth Gomez', '555-0910', true, NOW()),
('07718169-5a0f-47e4-84da-b423ad06de23', 'Ethan Murray', 6, '9th', '2010-09-30', 14, 'Nancy Murray', 'nancy.murray@email.com', '555-0911', 'Kevin Murray', '555-0912', true, NOW()),
('07718169-5a0f-47e4-84da-b423ad06de23', 'Daniel Phillips', 7, '9th', '2010-12-03', 14, 'Lisa Phillips', 'lisa.phillips@email.com', '555-0913', 'Brian Phillips', '555-0914', true, NOW()),
('07718169-5a0f-47e4-84da-b423ad06de23', 'Matthew Foster', 8, '9th', '2010-04-18', 14, 'Betty Foster', 'betty.foster@email.com', '555-0915', 'George Foster', '555-0916', true, NOW()),
('07718169-5a0f-47e4-84da-b423ad06de23', 'Anthony Gonzales', 9, '9th', '2010-08-25', 14, 'Helen Gonzales', 'helen.gonzales@email.com', '555-0917', 'Edward Gonzales', '555-0918', true, NOW()),
('07718169-5a0f-47e4-84da-b423ad06de23', 'Mark Bryant', 10, '9th', '2010-06-12', 14, 'Sandra Bryant', 'sandra.bryant@email.com', '555-0919', 'Ronald Bryant', '555-0920', true, NOW()),
('07718169-5a0f-47e4-84da-b423ad06de23', 'Donald Alexander', 11, '9th', '2010-10-07', 14, 'Donna Alexander', 'donna.alexander@email.com', '555-0921', 'Timothy Alexander', '555-0922', true, NOW()),
('07718169-5a0f-47e4-84da-b423ad06de23', 'Steven Russell', 12, '9th', '2010-02-28', 14, 'Carol Russell', 'carol.russell@email.com', '555-0923', 'Jason Russell', '555-0924', true, NOW());

-- WCS Lightning (U14 Boys) - Team ID: 8c2f4496-1842-426c-95b7-2d55a810f2ae
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('8c2f4496-1842-426c-95b7-2d55a810f2ae', 'Paul Griffin', 1, '9th', '2010-04-20', 14, 'Ruth Griffin', 'ruth.griffin@email.com', '555-1001', 'Andrew Griffin', '555-1002', true, NOW()),
('8c2f4496-1842-426c-95b7-2d55a810f2ae', 'Andrew Diaz', 2, '9th', '2010-08-15', 14, 'Sharon Diaz', 'sharon.diaz@email.com', '555-1003', 'Joshua Diaz', '555-1004', true, NOW()),
('8c2f4496-1842-426c-95b7-2d55a810f2ae', 'Joshua Hayes', 3, '9th', '2010-12-01', 14, 'Michelle Hayes', 'michelle.hayes@email.com', '555-1005', 'Kenneth Hayes', '555-1006', true, NOW()),
('8c2f4496-1842-426c-95b7-2d55a810f2ae', 'Kenneth Myers', 4, '9th', '2010-06-28', 14, 'Laura Myers', 'laura.myers@email.com', '555-1007', 'Kevin Myers', '555-1008', true, NOW()),
('8c2f4496-1842-426c-95b7-2d55a810f2ae', 'Kevin Ford', 5, '9th', '2010-09-14', 14, 'Sarah Ford', 'sarah.ford@email.com', '555-1009', 'Brian Ford', '555-1010', true, NOW()),
('8c2f4496-1842-426c-95b7-2d55a810f2ae', 'Brian Hamilton', 6, '9th', '2010-01-25', 14, 'Karen Hamilton', 'karen.hamilton@email.com', '555-1011', 'George Hamilton', '555-1012', true, NOW()),
('8c2f4496-1842-426c-95b7-2d55a810f2ae', 'George Graham', 7, '9th', '2010-11-19', 14, 'Nancy Graham', 'nancy.graham@email.com', '555-1013', 'Edward Graham', '555-1014', true, NOW()),
('8c2f4496-1842-426c-95b7-2d55a810f2ae', 'Edward Sullivan', 8, '9th', '2010-03-07', 14, 'Lisa Sullivan', 'lisa.sullivan@email.com', '555-1015', 'Ronald Sullivan', '555-1016', true, NOW()),
('8c2f4496-1842-426c-95b7-2d55a810f2ae', 'Ronald Wallace', 9, '9th', '2010-07-04', 14, 'Betty Wallace', 'betty.wallace@email.com', '555-1017', 'Timothy Wallace', '555-1018', true, NOW()),
('8c2f4496-1842-426c-95b7-2d55a810f2ae', 'Timothy Woods', 10, '9th', '2010-10-12', 14, 'Helen Woods', 'helen.woods@email.com', '555-1019', 'Jason Woods', '555-1020', true, NOW()),
('8c2f4496-1842-426c-95b7-2d55a810f2ae', 'Jason Cole', 11, '9th', '2010-05-26', 14, 'Sandra Cole', 'sandra.cole@email.com', '555-1021', 'Eric Cole', '555-1022', true, NOW()),
('8c2f4496-1842-426c-95b7-2d55a810f2ae', 'Eric West', 12, '9th', '2010-08-31', 14, 'Donna West', 'donna.west@email.com', '555-1023', 'Stephen West', '555-1024', true, NOW());

-- =============================================================================
-- U14 GIRLS TEAMS (1 team)
-- =============================================================================

-- WCS Sharks (U14 Girls) - Team ID: 201968c2-0eee-4084-8fde-e02326f376aa
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('201968c2-0eee-4084-8fde-e02326f376aa', 'Sophia Jordan', 1, '9th', '2010-03-15', 14, 'Carol Jordan', 'carol.jordan@email.com', '555-1101', 'Mark Jordan', '555-1102', true, NOW()),
('201968c2-0eee-4084-8fde-e02326f376aa', 'Charlotte Owens', 2, '9th', '2010-07-22', 14, 'Ruth Owens', 'ruth.owens@email.com', '555-1103', 'Donald Owens', '555-1104', true, NOW()),
('201968c2-0eee-4084-8fde-e02326f376aa', 'Amelia Reynolds', 3, '9th', '2010-01-10', 14, 'Sharon Reynolds', 'sharon.reynolds@email.com', '555-1105', 'Steven Reynolds', '555-1106', true, NOW()),
('201968c2-0eee-4084-8fde-e02326f376aa', 'Mia Fisher', 4, '9th', '2010-11-08', 14, 'Michelle Fisher', 'michelle.fisher@email.com', '555-1107', 'Paul Fisher', '555-1108', true, NOW()),
('201968c2-0eee-4084-8fde-e02326f376aa', 'Harper Ellis', 5, '9th', '2010-05-14', 14, 'Laura Ellis', 'laura.ellis@email.com', '555-1109', 'Andrew Ellis', '555-1110', true, NOW()),
('201968c2-0eee-4084-8fde-e02326f376aa', 'Evelyn Harrison', 6, '9th', '2010-09-30', 14, 'Sarah Harrison', 'sarah.harrison@email.com', '555-1111', 'Joshua Harrison', '555-1112', true, NOW()),
('201968c2-0eee-4084-8fde-e02326f376aa', 'Abigail Gibson', 7, '9th', '2010-12-03', 14, 'Karen Gibson', 'karen.gibson@email.com', '555-1113', 'Kenneth Gibson', '555-1114', true, NOW()),
('201968c2-0eee-4084-8fde-e02326f376aa', 'Emily Mcdonald', 8, '9th', '2010-04-18', 14, 'Nancy Mcdonald', 'nancy.mcdonald@email.com', '555-1115', 'Kevin Mcdonald', '555-1116', true, NOW()),
('201968c2-0eee-4084-8fde-e02326f376aa', 'Elizabeth Cruz', 9, '9th', '2010-08-25', 14, 'Lisa Cruz', 'lisa.cruz@email.com', '555-1117', 'Brian Cruz', '555-1118', true, NOW()),
('201968c2-0eee-4084-8fde-e02326f376aa', 'Sofia Marshall', 10, '9th', '2010-06-12', 14, 'Betty Marshall', 'betty.marshall@email.com', '555-1119', 'George Marshall', '555-1120', true, NOW()),
('201968c2-0eee-4084-8fde-e02326f376aa', 'Avery Ortiz', 11, '9th', '2010-10-07', 14, 'Helen Ortiz', 'helen.ortiz@email.com', '555-1121', 'Edward Ortiz', '555-1122', true, NOW()),
('201968c2-0eee-4084-8fde-e02326f376aa', 'Ella Gomez', 12, '9th', '2010-02-28', 14, 'Sandra Gomez', 'sandra.gomez@email.com', '555-1123', 'Ronald Gomez', '555-1124', true, NOW());

-- =============================================================================
-- U16 GIRLS TEAMS (6 teams)
-- =============================================================================

-- WCS Dupy (U16 Girls) - Team ID: 02fe83f0-9392-445d-9db2-71b257ddea75
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('02fe83f0-9392-445d-9db2-71b257ddea75', 'Madison Murray', 1, '11th', '2008-03-15', 16, 'Donna Murray', 'donna.murray@email.com', '555-1201', 'Timothy Murray', '555-1202', true, NOW()),
('02fe83f0-9392-445d-9db2-71b257ddea75', 'Scarlett Phillips', 2, '11th', '2008-07-22', 16, 'Carol Phillips', 'carol.phillips@email.com', '555-1203', 'Jason Phillips', '555-1204', true, NOW()),
('02fe83f0-9392-445d-9db2-71b257ddea75', 'Victoria Foster', 3, '11th', '2008-01-10', 16, 'Ruth Foster', 'ruth.foster@email.com', '555-1205', 'Eric Foster', '555-1206', true, NOW()),
('02fe83f0-9392-445d-9db2-71b257ddea75', 'Aria Gonzales', 4, '11th', '2008-11-08', 16, 'Sharon Gonzales', 'sharon.gonzales@email.com', '555-1207', 'Stephen Gonzales', '555-1208', true, NOW()),
('02fe83f0-9392-445d-9db2-71b257ddea75', 'Grace Bryant', 5, '11th', '2008-05-14', 16, 'Michelle Bryant', 'michelle.bryant@email.com', '555-1209', 'Andrew Bryant', '555-1210', true, NOW()),
('02fe83f0-9392-445d-9db2-71b257ddea75', 'Chloe Alexander', 6, '11th', '2008-09-30', 16, 'Laura Alexander', 'laura.alexander@email.com', '555-1211', 'Joshua Alexander', '555-1212', true, NOW()),
('02fe83f0-9392-445d-9db2-71b257ddea75', 'Camila Russell', 7, '11th', '2008-12-03', 16, 'Sarah Russell', 'sarah.russell@email.com', '555-1213', 'Kenneth Russell', '555-1214', true, NOW()),
('02fe83f0-9392-445d-9db2-71b257ddea75', 'Penelope Griffin', 8, '11th', '2008-04-18', 16, 'Karen Griffin', 'karen.griffin@email.com', '555-1215', 'Kevin Griffin', '555-1216', true, NOW()),
('02fe83f0-9392-445d-9db2-71b257ddea75', 'Riley Diaz', 9, '11th', '2008-08-25', 16, 'Nancy Diaz', 'nancy.diaz@email.com', '555-1217', 'Brian Diaz', '555-1218', true, NOW()),
('02fe83f0-9392-445d-9db2-71b257ddea75', 'Layla Hayes', 10, '11th', '2008-06-12', 16, 'Lisa Hayes', 'lisa.hayes@email.com', '555-1219', 'George Hayes', '555-1220', true, NOW()),
('02fe83f0-9392-445d-9db2-71b257ddea75', 'Lillian Myers', 11, '11th', '2008-10-07', 16, 'Betty Myers', 'betty.myers@email.com', '555-1221', 'Edward Myers', '555-1222', true, NOW()),
('02fe83f0-9392-445d-9db2-71b257ddea75', 'Nora Ford', 12, '11th', '2008-02-28', 16, 'Helen Ford', 'helen.ford@email.com', '555-1223', 'Ronald Ford', '555-1224', true, NOW());

-- WCS Potter (U16 Girls) - Team ID: bc371d01-4cc9-49bb-9cbc-2ccc154e03bb
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('bc371d01-4cc9-49bb-9cbc-2ccc154e03bb', 'Hannah Hamilton', 1, '11th', '2008-04-20', 16, 'Sandra Hamilton', 'sandra.hamilton@email.com', '555-1301', 'Timothy Hamilton', '555-1302', true, NOW()),
('bc371d01-4cc9-49bb-9cbc-2ccc154e03bb', 'Lily Graham', 2, '11th', '2008-08-15', 16, 'Donna Graham', 'donna.graham@email.com', '555-1303', 'Jason Graham', '555-1304', true, NOW()),
('bc371d01-4cc9-49bb-9cbc-2ccc154e03bb', 'Addison Sullivan', 3, '11th', '2008-12-01', 16, 'Carol Sullivan', 'carol.sullivan@email.com', '555-1305', 'Eric Sullivan', '555-1306', true, NOW()),
('bc371d01-4cc9-49bb-9cbc-2ccc154e03bb', 'Eleanor Wallace', 4, '11th', '2008-06-28', 16, 'Ruth Wallace', 'ruth.wallace@email.com', '555-1307', 'Stephen Wallace', '555-1308', true, NOW()),
('bc371d01-4cc9-49bb-9cbc-2ccc154e03bb', 'Natalie Woods', 5, '11th', '2008-09-14', 16, 'Sharon Woods', 'sharon.woods@email.com', '555-1309', 'Andrew Woods', '555-1310', true, NOW()),
('bc371d01-4cc9-49bb-9cbc-2ccc154e03bb', 'Luna Cole', 6, '11th', '2008-01-25', 16, 'Michelle Cole', 'michelle.cole@email.com', '555-1311', 'Joshua Cole', '555-1312', true, NOW()),
('bc371d01-4cc9-49bb-9cbc-2ccc154e03bb', 'Savannah West', 7, '11th', '2008-11-19', 16, 'Laura West', 'laura.west@email.com', '555-1313', 'Kenneth West', '555-1314', true, NOW()),
('bc371d01-4cc9-49bb-9cbc-2ccc154e03bb', 'Leah Jordan', 8, '11th', '2008-03-07', 16, 'Sarah Jordan', 'sarah.jordan@email.com', '555-1315', 'Kevin Jordan', '555-1316', true, NOW()),
('bc371d01-4cc9-49bb-9cbc-2ccc154e03bb', 'Hazel Owens', 9, '11th', '2008-07-04', 16, 'Karen Owens', 'karen.owens@email.com', '555-1317', 'Brian Owens', '555-1318', true, NOW()),
('bc371d01-4cc9-49bb-9cbc-2ccc154e03bb', 'Violet Reynolds', 10, '11th', '2008-10-12', 16, 'Nancy Reynolds', 'nancy.reynolds@email.com', '555-1319', 'George Reynolds', '555-1320', true, NOW()),
('bc371d01-4cc9-49bb-9cbc-2ccc154e03bb', 'Aurora Fisher', 11, '11th', '2008-05-26', 16, 'Lisa Fisher', 'lisa.fisher@email.com', '555-1321', 'Edward Fisher', '555-1322', true, NOW()),
('bc371d01-4cc9-49bb-9cbc-2ccc154e03bb', 'Nova Ellis', 12, '11th', '2008-08-31', 16, 'Betty Ellis', 'betty.ellis@email.com', '555-1323', 'Ronald Ellis', '555-1324', true, NOW());

-- WCS Red (U16 Girls) - Team ID: 17184fa5-8bc4-4bdc-9ae8-4af634e66d14
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('17184fa5-8bc4-4bdc-9ae8-4af634e66d14', 'Stella Harrison', 1, '11th', '2008-03-15', 16, 'Helen Harrison', 'helen.harrison@email.com', '555-1401', 'Timothy Harrison', '555-1402', true, NOW()),
('17184fa5-8bc4-4bdc-9ae8-4af634e66d14', 'Maya Gibson', 2, '11th', '2008-07-22', 16, 'Sandra Gibson', 'sandra.gibson@email.com', '555-1403', 'Jason Gibson', '555-1404', true, NOW()),
('17184fa5-8bc4-4bdc-9ae8-4af634e66d14', 'Willow Mcdonald', 3, '11th', '2008-01-10', 16, 'Donna Mcdonald', 'donna.mcdonald@email.com', '555-1405', 'Eric Mcdonald', '555-1406', true, NOW()),
('17184fa5-8bc4-4bdc-9ae8-4af634e66d14', 'Piper Cruz', 4, '11th', '2008-11-08', 16, 'Carol Cruz', 'carol.cruz@email.com', '555-1407', 'Stephen Cruz', '555-1408', true, NOW()),
('17184fa5-8bc4-4bdc-9ae8-4af634e66d14', 'Layla Marshall', 5, '11th', '2008-05-14', 16, 'Ruth Marshall', 'ruth.marshall@email.com', '555-1409', 'Andrew Marshall', '555-1410', true, NOW()),
('17184fa5-8bc4-4bdc-9ae8-4af634e66d14', 'Lillian Ortiz', 6, '11th', '2008-09-30', 16, 'Sharon Ortiz', 'sharon.ortiz@email.com', '555-1411', 'Joshua Ortiz', '555-1412', true, NOW()),
('17184fa5-8bc4-4bdc-9ae8-4af634e66d14', 'Nora Gomez', 7, '11th', '2008-12-03', 16, 'Michelle Gomez', 'michelle.gomez@email.com', '555-1413', 'Kenneth Gomez', '555-1414', true, NOW()),
('17184fa5-8bc4-4bdc-9ae8-4af634e66d14', 'Zoey Murray', 8, '11th', '2008-04-18', 16, 'Laura Murray', 'laura.murray@email.com', '555-1415', 'Kevin Murray', '555-1416', true, NOW()),
('17184fa5-8bc4-4bdc-9ae8-4af634e66d14', 'Mila Phillips', 9, '11th', '2008-08-25', 16, 'Sarah Phillips', 'sarah.phillips@email.com', '555-1417', 'Brian Phillips', '555-1418', true, NOW()),
('17184fa5-8bc4-4bdc-9ae8-4af634e66d14', 'Aubrey Foster', 10, '11th', '2008-06-12', 16, 'Karen Foster', 'karen.foster@email.com', '555-1419', 'George Foster', '555-1420', true, NOW()),
('17184fa5-8bc4-4bdc-9ae8-4af634e66d14', 'Hannah Gonzales', 11, '11th', '2008-10-07', 16, 'Nancy Gonzales', 'nancy.gonzales@email.com', '555-1421', 'Edward Gonzales', '555-1422', true, NOW()),
('17184fa5-8bc4-4bdc-9ae8-4af634e66d14', 'Lily Bryant', 12, '11th', '2008-02-28', 16, 'Lisa Bryant', 'lisa.bryant@email.com', '555-1423', 'Ronald Bryant', '555-1424', true, NOW());

-- WCS Swish (U16 Girls) - Team ID: 58231cab-79ea-4617-b219-4b92b97f744b
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('58231cab-79ea-4617-b219-4b92b97f744b', 'Addison Alexander', 1, '11th', '2008-04-20', 16, 'Betty Alexander', 'betty.alexander@email.com', '555-1501', 'Timothy Alexander', '555-1502', true, NOW()),
('58231cab-79ea-4617-b219-4b92b97f744b', 'Eleanor Russell', 2, '11th', '2008-08-15', 16, 'Helen Russell', 'helen.russell@email.com', '555-1503', 'Jason Russell', '555-1504', true, NOW()),
('58231cab-79ea-4617-b219-4b92b97f744b', 'Natalie Griffin', 3, '11th', '2008-12-01', 16, 'Sandra Griffin', 'sandra.griffin@email.com', '555-1505', 'Eric Griffin', '555-1506', true, NOW()),
('58231cab-79ea-4617-b219-4b92b97f744b', 'Luna Diaz', 4, '11th', '2008-06-28', 16, 'Donna Diaz', 'donna.diaz@email.com', '555-1507', 'Stephen Diaz', '555-1508', true, NOW()),
('58231cab-79ea-4617-b219-4b92b97f744b', 'Savannah Hayes', 5, '11th', '2008-09-14', 16, 'Carol Hayes', 'carol.hayes@email.com', '555-1509', 'Andrew Hayes', '555-1510', true, NOW()),
('58231cab-79ea-4617-b219-4b92b97f744b', 'Leah Myers', 6, '11th', '2008-01-25', 16, 'Ruth Myers', 'ruth.myers@email.com', '555-1511', 'Joshua Myers', '555-1512', true, NOW()),
('58231cab-79ea-4617-b219-4b92b97f744b', 'Hazel Ford', 7, '11th', '2008-11-19', 16, 'Sharon Ford', 'sharon.ford@email.com', '555-1513', 'Kenneth Ford', '555-1514', true, NOW()),
('58231cab-79ea-4617-b219-4b92b97f744b', 'Violet Hamilton', 8, '11th', '2008-03-07', 16, 'Michelle Hamilton', 'michelle.hamilton@email.com', '555-1515', 'Kevin Hamilton', '555-1516', true, NOW()),
('58231cab-79ea-4617-b219-4b92b97f744b', 'Aurora Graham', 9, '11th', '2008-07-04', 16, 'Laura Graham', 'laura.graham@email.com', '555-1517', 'Brian Graham', '555-1518', true, NOW()),
('58231cab-79ea-4617-b219-4b92b97f744b', 'Nova Sullivan', 10, '11th', '2008-10-12', 16, 'Sarah Sullivan', 'sarah.sullivan@email.com', '555-1519', 'George Sullivan', '555-1520', true, NOW()),
('58231cab-79ea-4617-b219-4b92b97f744b', 'Stella Wallace', 11, '11th', '2008-05-26', 16, 'Karen Wallace', 'karen.wallace@email.com', '555-1521', 'Edward Wallace', '555-1522', true, NOW()),
('58231cab-79ea-4617-b219-4b92b97f744b', 'Maya Woods', 12, '11th', '2008-08-31', 16, 'Nancy Woods', 'nancy.woods@email.com', '555-1523', 'Ronald Woods', '555-1524', true, NOW());

-- WCS Vipers (U16 Girls) - Team ID: f337f582-6b0f-4de8-87b7-c77e09401db8
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('f337f582-6b0f-4de8-87b7-c77e09401db8', 'Willow Cole', 1, '11th', '2008-03-15', 16, 'Lisa Cole', 'lisa.cole@email.com', '555-1601', 'Timothy Cole', '555-1602', true, NOW()),
('f337f582-6b0f-4de8-87b7-c77e09401db8', 'Piper West', 2, '11th', '2008-07-22', 16, 'Betty West', 'betty.west@email.com', '555-1603', 'Jason West', '555-1604', true, NOW()),
('f337f582-6b0f-4de8-87b7-c77e09401db8', 'Layla Jordan', 3, '11th', '2008-01-10', 16, 'Helen Jordan', 'helen.jordan@email.com', '555-1605', 'Eric Jordan', '555-1606', true, NOW()),
('f337f582-6b0f-4de8-87b7-c77e09401db8', 'Lillian Owens', 4, '11th', '2008-11-08', 16, 'Sandra Owens', 'sandra.owens@email.com', '555-1607', 'Stephen Owens', '555-1608', true, NOW()),
('f337f582-6b0f-4de8-87b7-c77e09401db8', 'Nora Reynolds', 5, '11th', '2008-05-14', 16, 'Donna Reynolds', 'donna.reynolds@email.com', '555-1609', 'Andrew Reynolds', '555-1610', true, NOW()),
('f337f582-6b0f-4de8-87b7-c77e09401db8', 'Zoey Fisher', 6, '11th', '2008-09-30', 16, 'Carol Fisher', 'carol.fisher@email.com', '555-1611', 'Joshua Fisher', '555-1612', true, NOW()),
('f337f582-6b0f-4de8-87b7-c77e09401db8', 'Mila Ellis', 7, '11th', '2008-12-03', 16, 'Ruth Ellis', 'ruth.ellis@email.com', '555-1613', 'Kenneth Ellis', '555-1614', true, NOW()),
('f337f582-6b0f-4de8-87b7-c77e09401db8', 'Aubrey Harrison', 8, '11th', '2008-04-18', 16, 'Sharon Harrison', 'sharon.harrison@email.com', '555-1615', 'Kevin Harrison', '555-1616', true, NOW()),
('f337f582-6b0f-4de8-87b7-c77e09401db8', 'Hannah Gibson', 9, '11th', '2008-08-25', 16, 'Michelle Gibson', 'michelle.gibson@email.com', '555-1617', 'Brian Gibson', '555-1618', true, NOW()),
('f337f582-6b0f-4de8-87b7-c77e09401db8', 'Lily Mcdonald', 10, '11th', '2008-06-12', 16, 'Laura Mcdonald', 'laura.mcdonald@email.com', '555-1619', 'George Mcdonald', '555-1620', true, NOW()),
('f337f582-6b0f-4de8-87b7-c77e09401db8', 'Addison Cruz', 11, '11th', '2008-10-07', 16, 'Sarah Cruz', 'sarah.cruz@email.com', '555-1621', 'Edward Cruz', '555-1622', true, NOW()),
('f337f582-6b0f-4de8-87b7-c77e09401db8', 'Eleanor Marshall', 12, '11th', '2008-02-28', 16, 'Karen Marshall', 'karen.marshall@email.com', '555-1623', 'Ronald Marshall', '555-1624', true, NOW());

-- WCS Williams (U16 Girls) - Team ID: 3cf2a31e-45de-4a14-b07a-e38d71c9dce2
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('3cf2a31e-45de-4a14-b07a-e38d71c9dce2', 'Natalie Ortiz', 1, '11th', '2008-04-20', 16, 'Nancy Ortiz', 'nancy.ortiz@email.com', '555-1701', 'Timothy Ortiz', '555-1702', true, NOW()),
('3cf2a31e-45de-4a14-b07a-e38d71c9dce2', 'Luna Gomez', 2, '11th', '2008-08-15', 16, 'Lisa Gomez', 'lisa.gomez@email.com', '555-1703', 'Jason Gomez', '555-1704', true, NOW()),
('3cf2a31e-45de-4a14-b07a-e38d71c9dce2', 'Savannah Murray', 3, '11th', '2008-12-01', 16, 'Betty Murray', 'betty.murray@email.com', '555-1705', 'Eric Murray', '555-1706', true, NOW()),
('3cf2a31e-45de-4a14-b07a-e38d71c9dce2', 'Leah Phillips', 4, '11th', '2008-06-28', 16, 'Helen Phillips', 'helen.phillips@email.com', '555-1707', 'Stephen Phillips', '555-1708', true, NOW()),
('3cf2a31e-45de-4a14-b07a-e38d71c9dce2', 'Hazel Foster', 5, '11th', '2008-09-14', 16, 'Sandra Foster', 'sandra.foster@email.com', '555-1709', 'Andrew Foster', '555-1710', true, NOW()),
('3cf2a31e-45de-4a14-b07a-e38d71c9dce2', 'Violet Gonzales', 6, '11th', '2008-01-25', 16, 'Donna Gonzales', 'donna.gonzales@email.com', '555-1711', 'Joshua Gonzales', '555-1712', true, NOW()),
('3cf2a31e-45de-4a14-b07a-e38d71c9dce2', 'Aurora Bryant', 7, '11th', '2008-11-19', 16, 'Carol Bryant', 'carol.bryant@email.com', '555-1713', 'Kenneth Bryant', '555-1714', true, NOW()),
('3cf2a31e-45de-4a14-b07a-e38d71c9dce2', 'Nova Alexander', 8, '11th', '2008-03-07', 16, 'Ruth Alexander', 'ruth.alexander@email.com', '555-1715', 'Kevin Alexander', '555-1716', true, NOW()),
('3cf2a31e-45de-4a14-b07a-e38d71c9dce2', 'Stella Russell', 9, '11th', '2008-07-04', 16, 'Sharon Russell', 'sharon.russell@email.com', '555-1717', 'Brian Russell', '555-1718', true, NOW()),
('3cf2a31e-45de-4a14-b07a-e38d71c9dce2', 'Maya Griffin', 10, '11th', '2008-10-12', 16, 'Michelle Griffin', 'michelle.griffin@email.com', '555-1719', 'George Griffin', '555-1720', true, NOW()),
('3cf2a31e-45de-4a14-b07a-e38d71c9dce2', 'Willow Diaz', 11, '11th', '2008-05-26', 16, 'Laura Diaz', 'laura.diaz@email.com', '555-1721', 'Edward Diaz', '555-1722', true, NOW()),
('3cf2a31e-45de-4a14-b07a-e38d71c9dce2', 'Piper Hayes', 12, '11th', '2008-08-31', 16, 'Sarah Hayes', 'sarah.hayes@email.com', '555-1723', 'Ronald Hayes', '555-1724', true, NOW());

-- =============================================================================
-- U18 BOYS TEAMS (1 team)
-- =============================================================================

-- WCS Legends (U18 Boys) - Team ID: 816e0a4b-7581-409e-b57d-476677fb066e
INSERT INTO players (team_id, name, jersey_number, grade, date_of_birth, age, parent_name, parent_email, parent_phone, emergency_contact, emergency_phone, is_active, created_at) VALUES
('816e0a4b-7581-409e-b57d-476677fb066e', 'Jackson Myers', 1, '12th', '2006-03-15', 18, 'Karen Myers', 'karen.myers@email.com', '555-1801', 'Timothy Myers', '555-1802', true, NOW()),
('816e0a4b-7581-409e-b57d-476677fb066e', 'Aiden Ford', 2, '12th', '2006-07-22', 18, 'Nancy Ford', 'nancy.ford@email.com', '555-1803', 'Jason Ford', '555-1804', true, NOW()),
('816e0a4b-7581-409e-b57d-476677fb066e', 'Lucas Hamilton', 3, '12th', '2006-01-10', 18, 'Lisa Hamilton', 'lisa.hamilton@email.com', '555-1805', 'Eric Hamilton', '555-1806', true, NOW()),
('816e0a4b-7581-409e-b57d-476677fb066e', 'Liam Graham', 4, '12th', '2006-11-08', 18, 'Betty Graham', 'betty.graham@email.com', '555-1807', 'Stephen Graham', '555-1808', true, NOW()),
('816e0a4b-7581-409e-b57d-476677fb066e', 'Noah Sullivan', 5, '12th', '2006-05-14', 18, 'Helen Sullivan', 'helen.sullivan@email.com', '555-1809', 'Andrew Sullivan', '555-1810', true, NOW()),
('816e0a4b-7581-409e-b57d-476677fb066e', 'Oliver Wallace', 6, '12th', '2006-09-30', 18, 'Sandra Wallace', 'sandra.wallace@email.com', '555-1811', 'Joshua Wallace', '555-1812', true, NOW()),
('816e0a4b-7581-409e-b57d-476677fb066e', 'William Woods', 7, '12th', '2006-12-03', 18, 'Donna Woods', 'donna.woods@email.com', '555-1813', 'Kenneth Woods', '555-1814', true, NOW()),
('816e0a4b-7581-409e-b57d-476677fb066e', 'James Cole', 8, '12th', '2006-04-18', 18, 'Carol Cole', 'carol.cole@email.com', '555-1815', 'Kevin Cole', '555-1816', true, NOW()),
('816e0a4b-7581-409e-b57d-476677fb066e', 'Benjamin West', 9, '12th', '2006-08-25', 18, 'Ruth West', 'ruth.west@email.com', '555-1817', 'Brian West', '555-1818', true, NOW()),
('816e0a4b-7581-409e-b57d-476677fb066e', 'Lucas Jordan', 10, '12th', '2006-06-12', 18, 'Sharon Jordan', 'sharon.jordan@email.com', '555-1819', 'George Jordan', '555-1820', true, NOW()),
('816e0a4b-7581-409e-b57d-476677fb066e', 'Henry Owens', 11, '12th', '2006-10-07', 18, 'Michelle Owens', 'michelle.owens@email.com', '555-1821', 'Edward Owens', '555-1822', true, NOW()),
('816e0a4b-7581-409e-b57d-476677fb066e', 'Alexander Reynolds', 12, '12th', '2006-02-28', 18, 'Laura Reynolds', 'laura.reynolds@email.com', '555-1823', 'Ronald Reynolds', '555-1824', true, NOW());

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
