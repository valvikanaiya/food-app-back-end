const mongoose = require("mongoose");
const dotenv = require("dotenv"); // Optional, if using environment variables

dotenv.config(); // Load environment variables (Optional)

const mongoURI = process.env.MONGODB_URI; // Replace with your connection details

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("Error", err));
