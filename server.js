const express = require("express");
const session = require('express-session');
const app = express();
const path = require("path");
const LogInCollection = require("./db/mongo");
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static("public"));

const viewsPath = path.join(__dirname, "views");
app.set("views", viewsPath);

app.use(session({
  secret: 'your-secret-key',
  resave: true,
  saveUninitialized: true
}));

// Middleware to check if the user is logged in (excluding the home page)
function requireLogin(req, res, next) {
  if (req.path === '/' || req.session.user) {
    // If it's the home page or user is logged in, proceed to the next middleware or route handler
    next();
  } else {
    // If user is not logged in and not on the home page, redirect to login page
    res.redirect('/login');
  }
}

app.get("/", (req, res) => {
  res.render("home", { naming: req.session.user });
});

// Use the updated middleware for other pages
app.get("/login-home", requireLogin, (req, res) => {
  res.render("login-home", { naming: req.session.user });
});

app.get("/login", (req, res) => {
  res.render("login", { errorMessage: "" });
});

app.get("/signup", (req, res) => {
  res.render("signup", { errorMessage: "" });
});

app.get("/analytics", requireLogin, (req, res) => {
  res.render("analytics", { naming: req.session.user });
});

app.get("/task-manager", requireLogin, (req, res) => {
  res.render("task-manager", { naming: req.session.user });
});

app.get("/profile", requireLogin, (req, res) => {
  res.render("profile", { naming: req.session.user });
});

app.post("/signup", async (req, res) => {
  try {
    console.log("Form submitted");
    const data = {
      name: req.body.name,
      password: req.body.password,
      security: req.body.security,
      answer: req.body.answer,
    };

    console.log("Data to be inserted:", data);

    const checking = await LogInCollection.findOne({ name: req.body.name });

    console.log("Existing user check:", checking);

    if (checking) {
      res.render("signup", { errorMessage: "User details already exist" });
    } else {
      await LogInCollection.insertMany([data]);
      console.log("Data inserted successfully");
      req.session.user = req.body.name; // Set user in session upon successful signup
      res.status(201).render("login-home", { naming: req.session.user });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Update the "/login" route
app.post("/login", async (req, res) => {
  try {
    const check = await LogInCollection.findOne({ name: req.body.name });

    if (check && check.password === req.body.password) {
      // Set user in session upon successful login
      req.session.user = check.name;
      // Render the login-home page with the user's name
      res.status(201).render("login-home", {
        naming: check.name, // Use the name from the database
      });
    } else {
      res.render("login", { errorMessage: "Incorrect username or password" });
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Add a new route for logout
app.get("/logout", (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    // Redirect the user to the home page after logout
    res.redirect("/");
  });
});

// Middleware to check if the user is logged in (excluding the home page)
function requireLogin(req, res, next) {
  if (req.path === '/' || req.session.user) {
    // If it's the home page or user is logged in, proceed to the next middleware or route handler
    next();
  } else {
    // If user is not logged in and not on the home page, redirect to login page
    res.redirect('/login');
  }
}

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
