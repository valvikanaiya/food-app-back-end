const express = require("express");
const router = express.Router();
const Post = require("../models/post");

router.post("/", (req, res) => {
  console.log("req");
  res.send("api work");
});

module.exports = router;
