// recipeModel.js
const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  //   ingredients: [
  //     {
  //       name: { type: String, required: true },
  //       quantity: String, // Quantity of the ingredient (e.g., "1 cup", "2 tbsp", etc.)
  //     },
  //   ],
  ingredients: [{ type: String, required: true }],
  instructions: { type: [String], required: true },
  imageUrl: String,
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
      value: { type: Number, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  rating: { type: Number },
  // Add more fields as needed

  prepTimeMinutes: { type: Number, required: true },
  cookTimeMinutes: { type: Number, required: true },
  servings: { type: Number, required: true },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  cuisine: String,
  caloriesPerServing: Number,
  tags: { type: [String], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  image: String,
  mealType: { type: [String] },
});

const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = Recipe;
