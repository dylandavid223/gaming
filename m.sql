-- Enhanced Developers Table
CREATE TABLE Developers (
    developer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    website VARCHAR(255),
    established_date DATE,
    headquarters VARCHAR(100)
);

-- Enhanced Games Table
CREATE TABLE Games (
    game_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    developer_id INT,
    release_date DATE,
    price DECIMAL(10, 2),
    description TEXT,
    genre VARCHAR(50),
    rating DECIMAL(3, 1),
    multiplayer BOOLEAN,
    platforms VARCHAR(100),
    cover_image_url VARCHAR(255),
    trailer_url VARCHAR(255),
    FOREIGN KEY (developer_id) REFERENCES Developers(developer_id)
);

-- Enhanced Users Table
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    account_status ENUM('active', 'suspended', 'banned') DEFAULT 'active',
    profile_picture VARCHAR(255),
    balance DECIMAL(10, 2) DEFAULT 0.00,
    country VARCHAR(50),
    bio TEXT,
    gaming_preferences JSON
);

-- UserLibrary Table
CREATE TABLE UserLibrary (
    library_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    playtime_hours DECIMAL(10, 1) DEFAULT 0.0,
    last_played DATETIME,
    achievements_completed INT DEFAULT 0,
    favorite BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (game_id) REFERENCES Games(game_id),
    UNIQUE (user_id, game_id)
);

CREATE TABLE GameSubmissions (
    submission_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT 'ID of the user who submitted the game',
    title VARCHAR(100) NOT NULL,
    developer_id INT NOT NULL,
    release_date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    genre VARCHAR(50) NOT NULL,
    rating ENUM('E', 'T', 'M', 'AO') NOT NULL DEFAULT 'E',
    multiplayer BOOLEAN DEFAULT FALSE,
    platforms VARCHAR(255) NOT NULL COMMENT 'Comma-separated list of platforms',
    cover_image_url VARCHAR(255) NOT NULL,
    submission_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_notes TEXT COMMENT 'Notes from admin review',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL COMMENT 'When admin reviewed the submission',
    FOREIGN KEY (developer_id) REFERENCES Developers(developer_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Insert Major Developers
INSERT INTO Developers (name, email, website, established_date, headquarters) VALUES
('Rockstar Games', 'support@rockstargames.com', 'https://www.rockstargames.com', '1998-12-01', 'New York, USA'),
('Infinity Ward', 'contact@infinityward.com', 'https://www.infinityward.com', '2002-05-01', 'Los Angeles, USA'),
('Naughty Dog', 'info@naughtydog.com', 'https://www.naughtydog.com', '1984-09-01', 'Santa Monica, USA'),
('Treyarch', 'support@treyarch.com', 'https://www.treyarch.com', '1996-01-01', 'Santa Monica, USA'),
('Ubisoft', 'contact@ubisoft.com', 'https://www.ubisoft.com', '1986-03-01', 'Montreuil, France');

-- Insert Popular Games
INSERT INTO Games (title, developer_id, release_date, price, description, genre, rating, multiplayer, platforms, cover_image_url) VALUES
('Red Dead Redemption 2', 1, '2018-10-26', 59.99, 'An epic tale of life in America''s unforgiving heartland', 'Action-Adventure', 9.7, TRUE, 'PS4, Xbox One, PC', 'https://res.cloudinary.com/dw0vhzpiu/image/upload/v1754999979/Gris_on_Instagram___RED_DEAD_REDEMPTION_2_wo9jxz.jpg'),
('Call of Duty: Modern Warfare', 2, '2019-10-25', 49.99, 'The stakes have never been higher as players take on the role of lethal Tier One operators', 'FPS', 8.5, TRUE, 'PS4, Xbox One, PC', 'https://res.cloudinary.com/dw0vhzpiu/image/upload/v1754999939/Call_of_Duty_4__Modern_Warfare_2007_snt3yp.jpg'),
('The Last of Us Part II', 3, '2020-06-19', 49.99, 'Ellie embarks on a relentless journey to carry out justice and find closure', 'Action-Adventure', 9.0, FALSE, 'PS4', 'https://res.cloudinary.com/dw0vhzpiu/image/upload/v1754999992/REFER%C3%8ANCIAS_A_TODO_VAPOR_A_Max_liberou_um_srae70.jpg'),
('Grand Theft Auto V', 1, '2013-09-17', 29.99, 'The biggest, most dynamic and most diverse open world ever created', 'Action-Adventure', 9.5, TRUE, 'PS4, Xbox One, PC', 'https://res.cloudinary.com/dw0vhzpiu/image/upload/v1754999968/Grand_Theft_Auto_V_vbvku7.jpg'),
('Call of Duty: Black Ops Cold War', 4, '2020-11-13', 59.99, 'The iconic Black Ops series returns with a direct sequel to the original Black Ops', 'FPS', 8.0, TRUE, 'PS4, PS5, Xbox One, Xbox Series X, PC', 'https://res.cloudinary.com/dw0vhzpiu/image/upload/v1754999954/Enter_And_win_pwhrlk.jpg'),
('Assassin''s Creed Valhalla', 5, '2020-11-10', 59.99, 'Become a legendary Viking warrior raised on tales of battle and glory', 'Action RPG', 8.5, FALSE, 'PS4, PS5, Xbox One, Xbox Series X, PC', 'https://res.cloudinary.com/dw0vhzpiu/image/upload/v1754999862/Assassin_s_Creed_Valhalla__Wrath_of_the_Druids_Satanasov_cszaeq.jpg');

-- Insert More Users with Gaming Profiles
INSERT INTO Users (username, email, password_hash, date_of_birth, registration_date, balance, country, bio) VALUES
('Gunslinger42', 'westernfan@example.com', '$2y$10$hashed1', '1992-07-15', '2021-01-10 14:30:00', 75.50, 'USA', 'RDR2 enthusiast and competitive shooter'),
('COD_Pro99', 'fpsmaster@example.com', '$2y$10$hashed2', '1995-03-22', '2021-02-05 09:15:00', 120.00, 'Canada', 'Professional Call of Duty player and streamer'),
('EllieFan', 'tlou_lover@example.com', '$2y$10$hashed3', '1990-11-30', '2021-03-20 18:45:00', 35.75, 'UK', 'The Last of Us superfan and collector'),
('LosSantosKing', 'gtaveteran@example.com', '$2y$10$hashed4', '1988-05-10', '2020-11-15 12:20:00', 200.00, 'Australia', 'GTA Online veteran with 5000+ hours'),
('VikingRaider', 'acvalhalla@example.com', '$2y$10$hashed5', '1994-09-18', '2021-04-05 20:15:00', 50.25, 'Norway', 'Assassin''s Creed historian and Norse mythology expert'),
('GameCollector', 'allgames@example.com', '$2y$10$hashed6', '1985-12-25', '2020-10-01 10:00:00', 300.50, 'Germany', 'Collector of all major game releases');

-- Insert Extensive Game Libraries
INSERT INTO UserLibrary (user_id, game_id, purchase_date, playtime_hours, last_played, achievements_completed, favorite) VALUES
-- Gunslinger42's library
(1, 1, '2021-02-01 16:20:00', 350.5, '2023-05-20 18:30:00', 87, TRUE),
(1, 4, '2021-03-15 10:00:00', 120.0, '2023-04-15 22:15:00', 45, FALSE),

-- COD_Pro99's library
(2, 2, '2021-01-05 12:30:00', 500.2, '2023-05-22 15:45:00', 65, TRUE),
(2, 5, '2021-04-10 09:20:00', 300.7, '2023-05-18 20:30:00', 50, TRUE),
(2, 1, '2021-06-15 14:10:00', 80.5, '2023-03-10 19:00:00', 30, FALSE),

-- EllieFan's library
(3, 3, '2021-03-25 20:15:00', 150.0, '2023-05-15 21:00:00', 100, TRUE),
(3, 1, '2021-07-10 11:40:00', 90.3, '2023-04-22 18:45:00', 40, FALSE),

-- LosSantosKing's library
(4, 4, '2020-12-01 10:00:00', 2500.0, '2023-05-22 23:00:00', 100, TRUE),
(4, 1, '2021-01-15 14:30:00', 400.5, '2023-05-10 20:15:00', 85, FALSE),
(4, 2, '2021-06-20 16:45:00', 150.2, '2023-04-30 19:30:00', 35, FALSE),

-- VikingRaider's library
(5, 6, '2021-01-05 08:20:00', 180.7, '2023-05-19 22:00:00', 95, TRUE),
(5, 1, '2021-03-10 12:15:00', 120.5, '2023-04-28 20:45:00', 60, FALSE),

-- GameCollector's library (all games)
(6, 1, '2021-01-01 10:00:00', 200.0, '2023-05-15 18:00:00', 75, FALSE),
(6, 2, '2021-01-01 10:05:00', 150.5, '2023-04-20 17:30:00', 60, FALSE),
(6, 3, '2021-01-01 10:10:00', 100.2, '2023-03-15 20:15:00', 90, TRUE),
(6, 4, '2021-01-01 10:15:00', 500.8, '2023-05-22 22:00:00', 100, FALSE),
(6, 5, '2021-01-01 10:20:00', 80.3, '2023-02-28 19:45:00', 40, FALSE),
(6, 6, '2021-01-01 10:25:00', 120.6, '2023-05-10 21:30:00', 85, FALSE);