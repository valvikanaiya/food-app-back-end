const jwt = require("jsonwebtoken");

function authenticateUserToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden", mess: err });
    req.user = user; // Attach user information to the request object
    next();
  });
}
module.exports = authenticateUserToken;