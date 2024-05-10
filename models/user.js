const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // User's unique identifier (e.g., email, username)
  username: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  // User's email address
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
    unique: true,
  },
  // Hashed password (use a secure hashing algorithm like bcrypt)
  password: {
    type: String,
    // required: true,
  },
  // User's profile picture URL (optional)
  profilePicture: {
    type: String,
  },
  // User's full name (optional)
  fullName: {
    type: String,
    trim: true,
  },
  // Bio for the user's profile (optional)
  bio: {
    type: String,
    trim: true,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
  // Timestamp of when the user account was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("user", userSchema);
