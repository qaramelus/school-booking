const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

// Middleware to validate token and authenticate user
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send("Unauthorized: No token provided");
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully", decoded);
    req.user = decoded; // Attach decoded user to the request object
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(401).send("Unauthorized: Invalid token");
  }
};

const isAdmin = [authMiddleware, (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(401).send("Access denied. Only admins can perform this.");
    }
    next();
}];

// In authMiddleware.js
const isAdminOrParent = [authMiddleware, (req, res, next) => {
  console.log("User role:", req.user.role); 
  if (req.user.role !== 'admin' && req.user.role !== 'parent') {
    return res.status(401).send("Access denied. Only admins and parents can perform this.");
  }
  next();
}];


module.exports = { authMiddleware, isAdmin, isAdminOrParent };