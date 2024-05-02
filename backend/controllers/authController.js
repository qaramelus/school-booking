// authController.js
// Import dependencies
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Environment variable for JWT
const JWT_SECRET = process.env.JWT_SECRET;

const authController = {
  // User Registration
  register: async (req, res) => {
    try {
      // Extract info from request body
      const { username, email, password, role } = req.body;
      console.log(`Registering user: ${email}`);

      // Validate user input
      if (!(email && password && username && role)) {
        console.log("Failed registration: Missing fields");
        return res.status(400).send("All input is required");
      }

      // Check if user already exists
      const oldUser = await User.findOne({ email });
      if (oldUser) {
        console.log(`Registration failed: User ${email} already exists`);
        return res.status(409).send("User already exists. Please login.");
      }

      //Encrypt user password
      const encryptedPassword = await bcrypt.hash(password, 10);

      // Create user in database
      const user = await User.create({
        username,
        email: email.toLowerCase(), // convert email to lowercase
        password: encryptedPassword,
        role
      });

      console.log(`User ${email} registered successfully`);

      // Create token
      const token = jwt.sign(
        { user_id: user._id, email, role },
        JWT_SECRET,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      // return new user
      res.status(201).json(user);
    } catch (err) {
      console.log(`Error in registration: ${err}`);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // User Login
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
        {
          expiresIn: "2h",
        }
      );

      // user
      res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: token // Explicitly include the token in the response
      });
    } else {
      console.log(`Login failed for ${email}: Invalid credentials`);
      res.status(400).send("Invalid Credentials");
    }
  } catch (err) {
    console.log(`Login error: ${err}`);
    res.status(500).json({ message: "Internal server error" });
  }
}
};

module.exports = authController;
