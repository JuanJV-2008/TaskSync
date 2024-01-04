const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/TaskSync")
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.log("Failed to connect to MongoDB:", error.message);
  });

// Define MongoDB schemas

// Schema for user login details
const logInSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Username is a required field
  },
  password: {
    type: String,
    required: true, // Password is a required field
  },
  security: {
    type: String,
    required: true, // Security question is a required field
  },
  answer: {
    type: String,
    required: true, // Security question answer is a required field
  },
});

// Schema for tasks
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Task title is a required field
  },
  description: {
    type: String,
    required: true, // Task description is a required field
  },
  startDate: {
    type: Date,
    required: true, // Start date is a required field
  },
  dueDate: {
    type: Date,
    required: true, // Due date is a required field
  },
  status: {
    type: String,
    required: true, // Task status is a required field
  },
  userId: {
    type: String,
    required: true, // User ID is a required field
  },
});

// Create MongoDB models

// Model for user login details
const LogInCollection = mongoose.model("LogInCollection", logInSchema);

// Model for tasks
const TaskCollection = mongoose.model("TaskCollection", taskSchema);

// Export models for use in other files
module.exports = { LogInCollection, TaskCollection };
