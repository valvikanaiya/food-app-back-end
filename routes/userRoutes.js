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
      res.send(userCount);
      if (!userCount) {
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

module.exports = router;
