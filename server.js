const express = require("express");
const mysql = require("mysql");
const session = require("express-session"); // Add at the top
const dbConn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "reddriot",
  port: 3307,
  database: "gaming_platform",
});
const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(express.static("img"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "cyberpunk_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Connect to MySQL
dbConn.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL database.");
});
app.use((req, res, next) => {
  if (req.session && req.session.userId) {
    res.locals.user = {
      userId: req.session.userId,
      username: req.session.username,
    };
  }
  next();
});

// Home page
app.get("/", (req, res) => {
  // If logged in, redirect to dashboard
  if (req.session && req.session.userId) {
    return res.redirect("/dashboard");
  }
  res.render("home.ejs");
});

// Login page
app.get("/login", (req, res) => {
  res.render("login.ejs", { error: null });
});

// Handle login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  dbConn.query(
    "SELECT * FROM Users WHERE username = ?",
    [username],
    (err, users) => {
      if (err) return res.render("login.ejs", { error: "Server error" });
      if (users.length === 0)
        return res.render("login.ejs", {
          error: "Invalid username or password",
        });
      // For demo: compare plain text (replace with hash check in production)
      if (users[0].password_hash !== password) {
        return res.render("login.ejs", {
          error: "Invalid username or password",
        });
      }
      // After successful login:
      req.session.userId = users[0].user_id;
      req.session.username = users[0].username;
      res.redirect("/client-dashboard");
    }
  );
});

// Signup page
app.get("/signup", (req, res) => {
  res.render("signup.ejs", { error: null });
});

// Handle signup
app.post("/signup", (req, res) => {
  const {
    username,
    email,
    password,
    confirmPassword,
    date_of_birth,
    country,
    bio,
  } = req.body;
  if (password !== confirmPassword) {
    return res.render("signup.ejs", { error: "Passwords do not match" });
  }
  dbConn.query(
    "INSERT INTO Users (username, email, password_hash, date_of_birth, country, bio) VALUES (?, ?, ?, ?, ?, ?)",
    [username, email, password, date_of_birth, country, bio],
    (err, result) => {
      if (err) {
        let msg = "Error creating account";
        if (err.code === "ER_DUP_ENTRY")
          msg = "Username or email already exists";
        return res.render("signup.ejs", { error: msg });
      }
      // Auto-login after signup
      req.session.userId = result.insertId;
      req.session.username = username;
      res.redirect("/client-dashboard");
    }
  );
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Protect dashboard and add pages
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect("/login");
  next();
}

app.get("/dashboard", requireLogin, (req, res) => {
  dbConn.query("SELECT * FROM Developers", function (devsErr, developers) {
    if (devsErr)
      return res
        .status(500)
        .json({ message: "Server Error", error: devsErr.message });

    dbConn.query("SELECT * FROM Games", function (gamesErr, games) {
      if (gamesErr)
        return res
          .status(500)
          .json({ message: "Server Error", error: gamesErr.message });

      dbConn.query("SELECT * FROM Users", function (usersErr, users) {
        if (usersErr)
          return res
            .status(500)
            .json({ message: "Server Error", error: usersErr.message });

        dbConn.query(
          "SELECT * FROM UserLibrary",
          function (libraryErr, libraries) {
            if (libraryErr)
              return res
                .status(500)
                .json({ message: "Server Error", error: libraryErr.message });

            // Map SQL IDs to 'id' for EJS compatibility
            const devs = developers.map((d) => ({
              ...d,
              id: d.developer_id,
            }));
            const gs = games.map((g) => ({
              ...g,
              id: g.game_id,
            }));
            const us = users.map((u) => ({
              ...u,
              id: u.user_id,
            }));
            const libs = libraries.map((l) => ({
              ...l,
              id: l.library_id,
            }));

            res.render("dashboard.ejs", {
              developers: devs,
              games: gs,
              users: us,
              libraries: libs,
            });
            console.log({
              developers: devs.length,
              games: gs.length,
              users: us.length,
              libraries: libs.length,
            });
          }
        );
      });
    });
  });
});

// Developers routes
app.get("/developers", requireLogin, (req, res) => {
  dbConn.query("SELECT * FROM Developers", (err, developers) => {
    if (err) {
      return res.status(500).send("Server Error");
    }
    res.render("developers.ejs", {
      developers,
      username: req.session.username,
    });
  });
});

app.get("/add-developer", requireLogin, (req, res) => {
  res.render("add-developer.ejs", { error: null });
});

app.post("/add-developer", requireLogin, (req, res) => {
  const { name, email, website, established_date, headquarters } = req.body;
  dbConn.query(
    "INSERT INTO Developers (name, email, website, established_date, headquarters) VALUES (?, ?, ?, ?, ?)",
    [name, email, website, established_date, headquarters],
    (err, result) => {
      if (err) return res.status(500).send("Error adding developer");
      res.redirect("/dashboard");
    }
  );
});

// Games routes
app.get("/games", requireLogin, (req, res) => {
  dbConn.query("SELECT * FROM Games", (err, games) => {
    if (err) {
      return res.status(500).send("Server Error");
    }
    res.render("games.ejs", { games, username: req.session.username });
  });
});

app.get("/add-game", requireLogin, (req, res) => {
  dbConn.query("SELECT * FROM Developers", (devsErr, developers) => {
    if (devsErr)
      return res
        .status(500)
        .json({ message: "Server Error", error: devsErr.message });

    res.render("add-game.ejs", { developers: developers, error: null });
  });
});

app.post("/add-game", requireLogin, (req, res) => {
  const {
    title,
    developer_id,
    release_date,
    price,
    description,
    genre,
    rating,
    multiplayer,
    platforms,
    cover_image_url,
  } = req.body;

  dbConn.query(
    "INSERT INTO Games (title, developer_id, release_date, price, description, genre, rating, multiplayer, platforms, cover_image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      title,
      developer_id,
      release_date,
      price,
      description,
      genre,
      rating,
      multiplayer,
      platforms,
      cover_image_url,
    ],
    (err, result) => {
      if (err) return res.status(500).send("Error adding game");
      res.redirect("/dashboard");
    }
  );
});

// Users routes
app.get("/users", (req, res) => {
  dbConn.query("SELECT * FROM Users", (err, users) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Server Error", error: err.message });
    }
    res.json(users);
  });
});

app.get("/add-user", requireLogin, (req, res) => {
  res.render("add-user.ejs", { error: null });
});

app.post("/add-user", requireLogin, (req, res) => {
  const {
    username,
    email,
    password_hash,
    date_of_birth,
    registration_date,
    balance,
    country,
    bio,
  } = req.body;

  dbConn.query(
    "INSERT INTO Users (username, email, password_hash, date_of_birth, registration_date, balance, country, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      username,
      email,
      password_hash,
      date_of_birth,
      registration_date,
      balance,
      country,
      bio,
    ],
    (err, result) => {
      if (err) return res.status(500).send("Error adding user");
      res.redirect("/dashboard");
    }
  );
});

// User Library routes
app.get("/library", requireLogin, (req, res) => {
  dbConn.query(
    `SELECT ul.*, g.title AS game_title 
     FROM UserLibrary ul
     JOIN Games g ON ul.game_id = g.game_id
     WHERE ul.user_id = ?`,
    [req.session.userId],
    (err, library) => {
      if (err) {
        return res.status(500).send("Server Error");
      }
      res.render("library.ejs", { library, username: req.session.username });
    }
  );
});

app.get("/add-library-entry", requireLogin, (req, res) => {
  dbConn.query("SELECT * FROM Users", (usersErr, users) => {
    if (usersErr)
      return res
        .status(500)
        .json({ message: "Server Error", error: usersErr.message });

    dbConn.query("SELECT * FROM Games", (gamesErr, games) => {
      if (gamesErr)
        return res
          .status(500)
          .json({ message: "Server Error", error: gamesErr.message });

      res.render("add-library-entry.ejs", {
        users: users,
        games: games,
        error: null,
      });
    });
  });
});

app.post("/add-library-entry", requireLogin, (req, res) => {
  const {
    user_id,
    game_id,
    purchase_date,
    playtime_hours,
    last_played,
    achievements_completed,
    favorite,
  } = req.body;

  dbConn.query(
    "INSERT INTO UserLibrary (user_id, game_id, purchase_date, playtime_hours, last_played, achievements_completed, favorite) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      user_id,
      game_id,
      purchase_date,
      playtime_hours,
      last_played,
      achievements_completed,
      favorite,
    ],
    (err, result) => {
      if (err) return res.status(500).send("Error adding library entry");
      res.redirect("/dashboard");
    }
  );
});

app.get("/test-ejs", (req, res) => {
  res.render("dashboard.ejs", {
    developers: [],
    games: [],
    users: [],
    libraries: [],
  });
});

app.get("/client-dashboard", requireLogin, (req, res) => {
  res.render("client-dashboard.ejs", { username: req.session.username });
});

app.get("/profile", requireLogin, (req, res) => {
  dbConn.query(
    "SELECT * FROM Users WHERE user_id = ?",
    [req.session.userId],
    (err, users) => {
      if (err || users.length === 0) {
        return res.status(500).send("Server Error");
      }
      res.render("profile.ejs", {
        user: users[0],
        username: req.session.username,
      });
    }
  );
});

// Add these routes with your other routes, before app.listen()

// Game Submission Form (GET)
app.get("/submit-game", requireLogin, (req, res) => {
  dbConn.query("SELECT * FROM Developers", (err, developers) => {
    if (err) {
      console.error("Error fetching developers:", err);
      return res.status(500).send("Server Error");
    }

    res.render("submit-game", {
      developers: developers,
      username: req.session.username,
      error: null,
    });
  });
});

// Handle Game Submission (POST)
app.post("/submit-game", requireLogin, (req, res) => {
  const {
    title,
    developer_id,
    release_date,
    price,
    description,
    genre,
    rating,
    multiplayer,
    platforms,
    cover_image_url,
  } = req.body;

  // Convert checkbox value to boolean
  const hasMultiplayer = multiplayer === "on" ? 1 : 0;

  // Basic validation
  if (
    !title ||
    !developer_id ||
    !release_date ||
    !price ||
    !description ||
    !genre ||
    !rating ||
    !platforms ||
    !cover_image_url
  ) {
    return dbConn.query("SELECT * FROM Developers", (err, developers) => {
      if (err) {
        console.error("Error fetching developers:", err);
        return res.status(500).send("Server Error");
      }

      return res.render("submit-game", {
        developers: developers,
        username: req.session.username,
        error: "Please fill in all required fields",
      });
    });
  }

  dbConn.query(
    "INSERT INTO Games (title, developer_id, release_date, price, description, genre, rating, multiplayer, platforms, cover_image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      title,
      developer_id,
      release_date,
      price,
      description,
      genre,
      rating,
      hasMultiplayer,
      platforms,
      cover_image_url,
    ],
    (err, result) => {
      if (err) {
        console.error("Error submitting game:", err);

        dbConn.query("SELECT * FROM Developers", (devErr, developers) => {
          if (devErr) {
            return res.status(500).send("Server Error");
          }

          return res.render("submit-game", {
            developers: developers,
            username: req.session.username,
            error: "Failed to submit game. Please try again.",
          });
        });
      } else {
        // Redirect to games list or show success message
        res.redirect("/games");
      }
    }
  );
});

app.listen(6002, () => {
  console.log("Server running on port 6002");
});
