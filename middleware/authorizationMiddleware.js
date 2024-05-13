// Authorization Middleware
function isRecipeAuthor(req, res, next) {
  const userId = req.user.id; // Assuming user ID is stored in the JWT payload
  const recipeUserId = req.recipe.userId;

  if (userId === recipeUserId) {
    req.isAuthor = true; // Attach isAuthor flag to the request object
  }

  next();
}

module.exports = authenticateToken;
