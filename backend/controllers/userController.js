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

exports.fetchUserDetails = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).send({ message: "Access forbidden: only admins can perform this action." });
        }

        const userId = req.params.userId;

        const user = await User.findById(userId)
                                .populate('parent', 'username email role') 
                                .populate('children', 'username email role'); 
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).send({ message: "Error fetching user details", error: error.message });
    }
};

exports.createChildUser = async (req, res) => {
    const { parentId } = req.params; 
    const childUserInfo = req.body; 

    if (req.user.role !== 'parent' && req.user.role !== 'admin') {
        return res.status(403).send({ message: "Access forbidden: only parents and admins can perform this action." });
    }

    try {
        const childUser = new User({
            ...childUserInfo,
            parent: parentId 
        });

        await childUser.save();

        await User.findByIdAndUpdate(parentId, {
            $push: { children: childUser._id }
        });

        res.status(201).send({ message: "Child user created successfully", childUser });
    } catch (error) {
        res.status(500).send({ message: "Error creating child user", error: error.message });
    }
};
