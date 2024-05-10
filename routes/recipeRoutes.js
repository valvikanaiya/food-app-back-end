// recipeRoutes.js
const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinaryConfig");
const Recipe = require("../models/recipe");

// Route to create a new recipe
router.get("/", async (req, res) => {
  try {
    const response = await Recipe.find({});
    res.send({ recipe: response });
    // res
    //   .status(201)
    //   .json({ message: "Recipe created successfully", recipe: response });
  } catch (error) {
    console.error("Error creating recipe:", error);
    res.status(500).json({ error: "Failed to create recipe" });
  }
});
// Route to create a new recipe
router.post("/add", async (req, res) => {
  try {
    const {
      title,
      description,
      ingredients,
      instructions,
      prepTimeMinutes,
      cookTimeMinutes,
      servings,
      difficulty,
      cuisine,
      caloriesPerServing,
      tags,
      userId,
      mealType,
    } = req.body;
    // Handle image upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    const imageUrl = result.secure_url;
    // Create new recipe
    const newRecipe = new Recipe({
      title,
      description,
      ingredients,
      instructions,
      prepTimeMinutes,
      cookTimeMinutes,
      servings,
      difficulty,
      cuisine,
      caloriesPerServing,
      tags,
      userId,
      mealType,
      imageUrl,
    });
    await newRecipe.save();
    res
      .status(201)
      .json({ message: "Recipe created successfully", recipe: newRecipe });
  } catch (error) {
    console.error("Error creating recipe:", error);
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

// Add routes for reading, updating, and deleting recipes as needed

router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    // Search recipes by title
    const recipes = await Recipe.find({
      title: { $regex: query, $options: "i" },
    });
    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error searching recipes:", error);
    res.status(500).json({ error: "Failed to search recipes" });
  }
});

// Route to filter recipes by category or other criteria
router.get("/filter", async (req, res) => {
  try {
    // Implement filtering logic based on query parameters
    // For example, filter by category: /recipes/filter?category=Dessert
    const { category } = req.query;
    const recipes = await Recipe.find({ category });
    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error filtering recipes:", error);
    res.status(500).json({ error: "Failed to filter recipes" });
  }
});

// Route to add a recipe to user's favorites
router.post("/:recipeId/favorite", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { userId } = req.body;
    // Find user by ID
    const user = await User.findById(userId);
    // Add recipe to user's favorites
    user.favorites.push(recipeId);
    await user.save();
    res.status(200).json({ message: "Recipe added to favorites successfully" });
  } catch (error) {
    console.error("Error adding recipe to favorites:", error);
    res.status(500).json({ error: "Failed to add recipe to favorites" });
  }
});

// Route to remove a recipe from user's favorites
router.delete("/:recipeId/favorite", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { userId } = req.body;
    // Find user by ID
    const user = await User.findById(userId);
    // Remove recipe from user's favorites
    user.favorites.pull(recipeId);
    await user.save();
    res
      .status(200)
      .json({ message: "Recipe removed from favorites successfully" });
  } catch (error) {
    console.error("Error removing recipe from favorites:", error);
    res.status(500).json({ error: "Failed to remove recipe from favorites" });
  }
});

router.post("/:recipeId/comments", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { userId, text } = req.body;
    // Find recipe by ID
    const recipe = await Recipe.findById(recipeId);
    // Add comment to recipe
    recipe.comments.push({ user: userId, text });
    await recipe.save();
    res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Route to add a rating to a recipe
router.post("/:recipeId/ratings", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { userId, value } = req.body;
    // Find recipe by ID
    const recipe = await Recipe.findById(recipeId);
    // Add rating to recipe
    recipe.ratings.push({ user: userId, value });
    await recipe.save();
    res.status(200).json({ message: "Rating added successfully" });
  } catch (error) {
    console.error("Error adding rating:", error);
    res.status(500).json({ error: "Failed to add rating" });
  }
});

// Add routes for updating and deleting comments and ratings as needed

module.exports = router;
