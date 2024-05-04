// authController.js
// Import dependencies
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Environment variable for JWT
const JWT_SECRET = process.env.JWT_SECRET;

const authController = {
  register: async (req, res) => {
    try {
      // Extract info from request body, including new fields
      const { username, email, password, role, firstName, lastName, address, phone } = req.body;
      console.log(`Registering user: ${email}`);

      // Validate user input for all required fields
      if (!(email && password && username && role && firstName && lastName && address && phone)) {
        console.log("Failed registration: Missing fields");
        return res.status(400).send("All input is required");
      }

      const oldUser = await User.findOne({ email });
      if (oldUser) {
        console.log(`Registration failed: User ${email} already exists`);
        return res.status(409).send("User already exists. Please login.");
      }

      const encryptedPassword = await bcrypt.hash(password, 10);

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
        password: encryptedPassword,
        role
      });

      console.log(`User ${email} registered successfully`);

      // Create token
      const token = jwt.sign(
        { user_id: user._id, email, role },
        JWT_SECRET,
        { expiresIn: "2h" }
      );

      // Save user token
      user.token = token;

      // Return new user
      res.status(201).json(user);
    } catch (err) {
      console.error(`Error in registration: ${err}`);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // User Login
  login: async (req, res) => {
    try {
      // Extract info from request body
      const { email, password } = req.body;
      console.log(`Attempting login for: ${email}`);

      // Validate user input
      if (!(email && password)) {
        console.log("Login failed: Missing email or password");
        return res.status(400).send("All input is required");
      }

      // Validate if user exists in our database
      const user = await User.findOne({ email });

      if (user && (await bcrypt.compare(password, user.password))) {
        console.log(`User ${email} logged in successfully`);

        // Create token
        const token = jwt.sign(
          { user_id: user._id, email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "2h" }
        );

        // Return user details
        res.status(200).json({
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          token: token 
        });
      } else {
        console.log(`Login failed for ${email}: Invalid credentials or password mismatch`);
        res.status(400).send("Invalid Credentials");
      }
    } catch (err) {
      console.error(`Login error: ${err}`);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

module.exports = authController;
