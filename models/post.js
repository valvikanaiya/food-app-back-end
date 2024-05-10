const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  // User who created the post (reference to User model)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  // Caption or description for the post
  caption: {
    type: String,
    trim: true,
    maxlength: 2200, // Maximum allowed characters, adjust as needed
  },
  // Image data (store the actual image data or a reference to its location)
  image: {
    type: String, // Adjust based on your image storage approach (URL, path)
    required: true,
  },
  // Timestamp of when the post was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // List of user IDs who liked the post
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "user",
    default: [],
  },
  // List of comments associated with the post (optional)
  comments: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "comment", // Reference to the Comment model (if applicable)
    default: [],
  },
});

module.exports = mongoose.model("post", postSchema);
