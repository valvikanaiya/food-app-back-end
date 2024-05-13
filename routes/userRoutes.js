const express = require("express");
const router = express.Router();

const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { default: axios } = require("axios");

async function getUserProfile(accessToken) {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data; // This will contain the user's profile information
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
}

router.post("/signup", async (req, res) => {
  const { auth } = req.body;
  const userInfo = await getUserProfile(auth);
  try {
    if (userInfo) {
      // Extract user details
      const userDetails = {
        email: userInfo.email,
        fullName: userInfo.name,
        username: userInfo.given_name,
        profilePicture: userInfo.picture,
        // Add other details you need here
      };
      const userCount = await User.find({ email: userDetails.email });
      if (!userCount.length > 0) {
        const newUser = new User(userDetails);
        const user = await newUser.save();
        const { email, fullName, profilePicture, username, _id } = user._doc;
        const newUserDetails = {
          id: _id,
          email,
          username,
          fullName,
          profilePicture,
        };

        // Create a JWT token with the user details
        const jwtToken = jwt.sign(newUserDetails, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        res.json({ token: jwtToken, ...newUserDetails });
      } else {
        const { email, fullName, profilePicture, username, _id } = userCount[0];
        const newUserDetails = {
          id: _id,
          email,
          username,
          fullName,
          profilePicture,
        };

        // Create a JWT token with the user details
        const jwtToken = jwt.sign(newUserDetails, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        res.json({ token: jwtToken, ...newUserDetails });
      }

      // Send the JWT token and user details back to the client
    }
  } catch (error) {
    res.send({ error });
  }
});

router.post("/collections", async (req, res) => {
  try {
    const { userId, name } = req.body;
    // Find user by ID
    const user = await User.findById(userId);
    // Create new collection
    user.collections.push({ name, recipes: [] });
    await user.save();
    res.status(201).json({ message: "Collection created successfully" });
  } catch (error) {
    console.error("Error creating collection:", error);
    res.status(500).json({ error: "Failed to create collection" });
  }
});

// Route to add a recipe to a collection
router.post("/collections/:collectionId/add", async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { recipeId } = req.body;
    // Find collection by ID
    const collection = await User.updateOne(
      { "collections._id": collectionId },
      { $addToSet: { "collections.$.recipes": recipeId } }
    );
    res
      .status(200)
      .json({ message: "Recipe added to collection successfully" });
  } catch (error) {
    console.error("Error adding recipe to collection:", error);
    res.status(500).json({ error: "Failed to add recipe to collection" });
  }
});

module.exports = router;
