// authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 
const { encryptPassword } = require('../middlewares/authMiddleware'); 

// Ensure the JWT_SECRET is available
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

const authController = {
  // Register a new user using middleware for password encryption
  register: [encryptPassword, async (req, res) => {
    try {
      const { username, email, role, firstName, lastName, address, phone, encryptedPassword } = req.body;
      console.log(`Registering user: ${email}`);

      if (!(email && username && role && firstName && lastName && address && phone)) {
        console.log("Failed registration: Missing fields");
        return res.status(400).send("All input is required");
      }

      const oldUser = await User.findOne({ email: email.toLowerCase() });
      if (oldUser) {
        console.log(`Registration failed: User ${email} already exists`);
        return res.status(409).send("User already exists. Please login.");
      }

      const user = await User.create({
        firstName,
        lastName,
        address: {
          street: address.street,
          city: address.city,
          zipCode: address.zipCode
        },
        phone,
        username,
        email: email.toLowerCase(),
        password: encryptedPassword, // Use the encrypted password from middleware
        role
      });

      const token = jwt.sign(
        { user_id: user._id, email, role },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      console.log(`User ${email} registered successfully with token: ${token}`);
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: token
      });
    } catch (err) {
      console.error(`Error in registration: ${err}`);
      res.status(500).json({ message: "Internal server error during registration", error: err.message });
    }
  }],

  // User Login
  login: async (req, res) => {
    let email; // Declare `email` at a higher scope so it's accessible in the catch block
    try {
      email = req.body.email.toLowerCase(); // Use and assign `email` here
      const { password } = req.body;

      console.log(`Attempting login for: ${email}`);

      if (!(email && password)) {
        console.log("Login failed: Missing email or password");
        return res.status(400).send("All input is required");
      }

      const user = await User.findOne({ email });
      if (!user) {
        console.log(`Login failed: User not found for ${email}`);
        return res.status(404).send("User not found");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      console.log(`Password comparison for ${email}: ${isMatch}`);
      if (isMatch) {
        const token = jwt.sign(
          { user_id: user._id, email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "2h" }
        );

        console.log(`User ${email} logged in successfully, token issued.`);
        res.status(200).json({
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          token: token
        });
      } else {
        console.log(`Invalid credentials attempt for ${email}`);
        res.status(401).send("Invalid credentials");
      }
    } catch (err) {
      console.error(`Login error for ${email}: ${err}`);
      res.status(500).json({ message: "Internal server error during login", error: err.message });
    }
  }
};

module.exports = authController;
