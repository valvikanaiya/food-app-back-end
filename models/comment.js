const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  // User who created the comment
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  // Content of the comment
  content: {
    type: String,
    trim: true,
    required: true,
    maxlength: 2000, // Maximum allowed characters, adjust as needed
  },
  // Timestamp of when the comment was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // (Optional) Reference to the parent comment if replying to a comment
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "comment",
    default: null,
  },
});

module.exports = mongoose.model("comment", commentSchema);
