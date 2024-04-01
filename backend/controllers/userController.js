const User = require('../models/User'); 

exports.fetchAllUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).send({ message: "Access forbidden: only admins can perform this action." });
        }

        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).send({ message: "Error fetching users", error: error.message });
    }
};
