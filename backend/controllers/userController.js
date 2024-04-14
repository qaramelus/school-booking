// userController.js
const User = require('../models/User'); 

exports.fetchAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).send({ message: "Error fetching users", error: error.message });
    }
};

exports.fetchUserDetails = async (req, res) => {
    try {
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

    try {
        const childUser = new User({
            ...childUserInfo,
            parent: parentId 
        });

        await childUser.save();
        await User.findByIdAndUpdate(parentId, { $push: { children: childUser._id }});

        res.status(201).send({ message: "Child user created successfully", childUser });
    } catch (error) {
        res.status(500).send({ message: "Error creating child user", error: error.message });
    }
};

exports.fetchChildrenForParent = async (req, res) => {
    try {
        const parentId = req.params.parentId;
        const children = await User.find({ parent: parentId });
        res.json(children);
    } catch (error) {
        res.status(500).send({ message: "Error fetching children", error: error.message });
    }
};

exports.fetchTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' });
        res.json(teachers);
    } catch (error) {
        res.status(500).send({ message: "Error fetching teachers", error: error.message });
    }
};

