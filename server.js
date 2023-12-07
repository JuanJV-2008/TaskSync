const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require('express-session');
const path = require("path");
const mongoose = require("mongoose");
const LogInCollection = require("./db/mongo"); // Import your LogInCollection model
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
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

// MongoDB connection setup
mongoose.connect("mongodb://localhost:27017/TaskSync", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Add this route handler at the end of your server.js file
app.get("/password-updated", (req, res) => {
  res.render("password-updated");
});

// Route to handle updating the password
app.post("/update-password", async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    // Find the user by username using the LogInCollection model
    const user = await LogInCollection.findOne({ name: username });

    if (!user) {
      // Handle case where the user is not found
      return res.status(404).send("User not found");
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();

    // Redirect or render a success message as needed
    res.redirect("/password-updated"); // You can create a separate view for password update success
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Add this route before your other routes
app.get("/recover-password", (req, res) => {
  res.render("forgot-password");
});

app.post("/recover-password", async (req, res) => {
  try {
    const { name } = req.body;
    const user = await LogInCollection.findOne({ name });

    if (!user) {
      return res.render("forgot-password", { errorMessage: "Username not found" });
    }

    // Set user in session for password recovery
    req.session.user = user.name;

    res.render("answer-security-question", { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/forgot-password", (req, res) => {
  res.render("forgot-password");
});

app.post("/forgot-password", async (req, res) => {
  try {
    const { name } = req.body;
    const user = await LogInCollection.findOne({ name });

    if (!user) {
      // Handle case where username doesn't exist
      return res.render("forgot-password", { errorMessage: "Username not found" });
    }

    // Set user in session for password recovery
    req.session.user = user.name;

    // Render a new view to answer the security question
    res.render("answer-security-question", { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/complete-password-recovery", async (req, res) => {
  try {
    const { answer, newPassword } = req.body;
    console.log("Session user:", req.session.user); // Log the session user
    const user = await LogInCollection.findOne({ name: req.session.user });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check if the provided answer matches the stored answer
    if (answer === user.answer) {
      // Render the page with the form to edit the password
      res.render("complete-password-recovery", { user, editPassword: true });
    } else {
      // Display an error message or redirect to the previous step
      res.render("answer-security-question", { user, errorMessage: "Incorrect answer" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
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

app.get("/profile", requireLogin, async (req, res) => {
  try {
      const user = await LogInCollection.findOne({ name: req.session.user });

      if (!user) {
          // Handle the case where the user is not found
          return res.status(404).send("User not found");
      }

      res.render("profile", { user });
  } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
  }
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

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
