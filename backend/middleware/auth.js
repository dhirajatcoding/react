// backend/middleware/auth.js
// This is a middleware that protects routes
// Any route that needs login will use this

const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {

  // Frontend sends token in the header like:
  // Authorization: Bearer eyJhbGci...
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, access denied" });
  }

  // Extract the token part after "Bearer "
  const token = authHeader.split(" ")[1];

  try {
    // Verify the token using our secret key
    // If valid, decoded = { id: "...", role: "...", iat: ..., exp: ... }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to req so the next route can use it
    req.user = decoded;

    // next() means "ok this middleware is done, go to the actual route now"
    next();

  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = verifyToken;