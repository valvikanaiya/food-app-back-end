require("./config/database");
const express = require("express");
const postRout = require("./routes/postRouts");
const userRoutes = require("./routes/userRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1/post", postRout);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/recipes", recipeRoutes);
app.listen(3002);
