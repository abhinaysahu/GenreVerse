const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  googleId: String,
  history: [
    {
      filename: String,
      result: Object,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
