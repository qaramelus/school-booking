// Import dependencies
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Environment variable for JWT
const JWT_SECRET = "739353f1537874c2700b8f39fa626ce39d10b5f0dad36e0b4b7761105892ff95";

const authController = {
  // User Registration
  register: async (req, res) => {
    try {
      // Extract info from request body
      const { username, email, password, role } = req.body;

      // Validate user input
      if (!(email && password && username && role)) {
        return res.status(400).send("All input is required");
      }

      // Check if user already exists
      const oldUser = await User.findOne({ email });
      if (oldUser) {
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
      console.log(err);
    }
  },

  // User Login
  login: async (req, res) => {
    try {
      // Extract info from request body
      const { email, password } = req.body;

      // Validate user input
      if (!(email && password)) {
        return res.status(400).send("All input is required");
      }

      // Validate if user exist in our database
      const user = await User.findOne({ email });

      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, email, role: user.role },
          JWT_SECRET,
          {
            expiresIn: "2h",
          }
        );

        // save user token
        user.token = token;

        // user
        res.status(200).json(user);
      } else {
        res.status(400).send("Invalid Credentials");
      }
    } catch (err) {
      console.log(err);
    }
  }
};

module.exports = authController;
