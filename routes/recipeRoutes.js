// recipeRoutes.js
const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinaryConfig");
const Recipe = require("../models/recipe");
const User = require("../models/user");
const authenticateToken = require("../middleware/authenticationMiddleware");
const authenticateUserToken = require("../middleware/privateMiddkeware");

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

// Route to add a recipe to user's favorites
router.post("/favorite/:recipeId", authenticateUserToken, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;
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
router.delete(
  "/favorite/:recipeId",
  authenticateUserToken,
  async (req, res) => {
    try {
      const { recipeId } = req.params;
      const userId = req.user.id;
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
  }
);

router.post("/comments/:recipeId", authenticateUserToken, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req?.user?.id;
    const { text } = req.body;
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
router.delete(
  "/comments/:recipeId/",
  authenticateUserToken,
  async (req, res) => {
    try {
      const { recipeId } = req.params;
      const { commentId } = req.body;
      const userId = req.user.id;

      // Find the recipe by ID
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }

      // Find the comment index in the recipe's comments array
      const commentIndex = recipe.comments.findIndex(
        (comment) => comment._id.toString() === commentId
      );

      // Check if the comment exists
      if (commentIndex === -1) {
        return res.status(404).json({ error: "Comment not found" });
      }

      // Check if the user is the author of the comment
      if (recipe.comments[commentIndex].user.toString() !== userId) {
        return res.status(403).json({
          error: "Unauthorized: You are not the author of this comment",
        });
      }

      // Remove the comment from the recipe's comments array
      recipe.comments.splice(commentIndex, 1);

      // Save the recipe
      await recipe.save();

      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  }
);
// Route to add a rating to a recipe
router.post("/ratings/:recipeId", authenticateUserToken, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req?.user?.id;
    const { value } = req.body;
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
// Route to fetch favorite recipes for a user
router.get("/favorites", authenticateUserToken, async (req, res) => {
  try {
    // Extract user ID from the request
    const userId = req?.user?.id || null; // Assuming the user ID is extracted from the JWT token

    // Find the user by their ID and populate the favorites field
    const user = await User.findById(userId).populate("favorites");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Extract favorite recipes from the user object
    const favoriteRecipes = user.favorites;

    // Return the favorite recipes in the response payload
    res.status(200).json({ favoriteRecipes });
  } catch (error) {
    console.error("Error fetching favorite recipes:", error);
    res.status(500).json({ error: "Failed to fetch favorite recipes" });
  }
});

// Route to fetch a single recipe with author details and comments
router.get("/view/:recipeId", authenticateToken, async (req, res) => {
  try {
    const { recipeId } = req.params;
    let userId = req?.user?.id || null; // Assuming user ID is stored in the JWT payload

    // Fetch the recipe by its ID
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Fetch total count of comments for the recipe
    const totalComments = recipe.comments.length;

    // Fetch comments for the recipe
    const comments = recipe.comments;

    // Fetch user details for the recipe author
    let author;
    let isAuthor = false;
    if (req.user) {
      // If user is authenticated, fetch author details
      author = await User.findById(recipe.userId, {
        fullName: 1,
        email: 1,
        profilePicture: 1,
      });
      const userId = req.user.id;
      const recipeUserId = recipe.userId.toString();
      isAuthor = userId === recipeUserId;
    }

    // Return the recipe data along with
    // Optionally, you can populate the user field in comments to get user details
    // await recipe.populate('comments.user').execPopulate();

    // Return the recipe along with author details, total comments, and comments
    res.status(200).json({
      recipe,
      author,
      isAuthor,
      totalComments,
      comments,
    });
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
});

// Route to fetch paginated recipes
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page number, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of recipes per page, default is 10

    // Calculate the skip value based on page number and limit
    const skip = (page - 1) * limit;

    // Fetch total count of recipes
    const totalCount = await Recipe.countDocuments();

    // Fetch recipes from the database with pagination
    const recipes = await Recipe.find({}).skip(skip).limit(limit);

    // Map the recipes to include only the required keys
    console.log(recipes);
    const simplifiedRecipes = recipes.map((recipe) => ({
      id: recipe?._id,
      imageUrl: recipe.image,
      rating: recipe.rating,
      title: recipe.name,
    }));

    res
      .status(200)
      .json({ recipes: simplifiedRecipes, page, limit, totalCount });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ error: "Failed to fetch recipes." });
  }
});

// Route to filter recipes by category or other criteria
router.get("/filter", async (req, res) => {
  try {
    // Implement filtering logic based on query parameters
    // For example, filter by category: /recipes/filter?category=Dessert
    const difficulty = req.query.difficulty;
    const page = parseInt(req.query.page) || 1; // Current page number, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of recipes per page, default is 10

    // Calculate the skip value based on page number and limit
    const skip = (page - 1) * limit;

    const recipes = await Recipe.find({ difficulty }).skip(skip).limit(limit);
    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error filtering recipes:", error);
    res.status(500).json({ error: "Failed to filter recipes" });
  }
});

// Route to search recipes
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    console.log(query);
    // Search recipes by title
    const recipes = await Recipe.find({
      name: { $regex: query, $options: "i" },
    });
    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error searching recipes:", error);
    res.status(500).json({ error: "Failed to search recipes" });
  }
});

// Add routes for updating and deleting comments and ratings as needed

module.exports = router;
