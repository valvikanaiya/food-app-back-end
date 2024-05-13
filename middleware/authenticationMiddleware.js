// const jwt = require("jsonwebtoken");

// function authenticateToken(req, res, next) {
//   const authHeader = req.headers["authorization"];

//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) return res.status(401).json({ error: "Unauthorized" });

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ error: "Forbidden", mess: err });
//     req.user = user; // Attach user information to the request object
//     next();
//   });
// }

// module.exports = authenticateToken;
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization;

  // Check if token is present
  if (!token) {
    // If token is not present, proceed without authentication
    return next();
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) {
      // If token is invalid, proceed without authentication
      return next();
    } else {
      // If token is valid, attach user details to the request object
      req.user = decodedToken;
      next(); // Proceed to the next middleware or route handler
    }
  });
};

module.exports = authenticateToken;
