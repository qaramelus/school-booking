const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      return res.status(401).send("Unauthorized: No token provided");
    }

    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user_id);

    if (!user) {
      return res.status(401).send("Unauthorized: User not found");
    }
    
    // Check if the user has the admin role
    if (user.role !== 'admin') {
      return res.status(403).send("Forbidden: Requires admin role");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(401).send("Unauthorized: Invalid token");
  }
};

module.exports = authMiddleware;
