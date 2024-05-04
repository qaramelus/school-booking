// authController.js
// Import dependencies
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Ensure the JWT_SECRET is available
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1); // Exit application if JWT_SECRET is not defined
}

const authController = {
  // Register a new user
  register: async (req, res) => {
    try {
      const { username, email, password, role, firstName, lastName, address, phone } = req.body;
      console.log(`Registering user: ${email}`);

      if (!(email && password && username && role && firstName && lastName && address && phone)) {
        console.log("Failed registration: Missing fields");
        return res.status(400).send("All input is required");
      }

      const oldUser = await User.findOne({ email: email.toLowerCase() });
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
  },

  // User Login
login: async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Attempting login for: ${email.toLowerCase()}`);

    if (!(email && password)) {
      console.log("Login failed: Missing email or password");
      return res.status(400).send("All input is required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`Login failed: User not found for ${email.toLowerCase()}`);
      return res.status(404).send("User not found");
    }

    console.log(`Stored Hashed Password for ${email}: ${user.password}`);
    console.log(`Hash of Provided Password: ${await bcrypt.hash(password, 10)}`); // for debugging only

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password comparison for ${email}: ${isMatch}`);
    if (isMatch) {
      const token = jwt.sign(
        { user_id: user._id, email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      console.log(`User ${email.toLowerCase()} logged in successfully, token issued.`);
      res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: token
      });
    } else {
      console.log(`Invalid credentials attempt for ${email.toLowerCase()}`);
      res.status(401).send("Invalid credentials");
    }
  } catch (err) {
    console.error(`Login error for ${email.toLowerCase()}: ${err}`);
    res.status(500).json({ message: "Internal server error during login", error: err.message });
  }
}
};


module.exports = authController;
