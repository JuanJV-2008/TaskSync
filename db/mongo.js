const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/TaskSync")
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((e) => {
    console.log("failed to connect");
  });

const logInSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  security: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

const LogInCollection = mongoose.model("LogInCollection", logInSchema);

module.exports = LogInCollection;