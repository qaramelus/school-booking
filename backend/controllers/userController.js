// userController.js
const User = require('../models/User'); 
const { generateUsername } = require('../middlewares/userMiddleware');

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

exports.createParentUser = async (req, res) => {
    console.log("Received body for parent creation:", req.body);
    const parentUserInfo = {
        ...req.body,
        role: 'parent'
    };

    // Create a new instance of the User model with the parentUserInfo
    const parentUser = new User(parentUserInfo);

    // Execute the middleware manually before saving the parentUser
    try {
        await generateUsername.call(parentUser, async function(err) {
            if (err) {
                console.log("Error in middleware:", err.message);
                return res.status(400).send({ message: "Error generating username", error: err.message });
            }
            console.log("User instance after middleware execution:", parentUser);
            // Save the parentUser after the middleware has been executed
            await parentUser.save();
            res.status(201).send({ message: "Parent user created successfully", parentUser });
        });
    } catch (error) {
        console.log("Error during user save:", error);  // More detailed error logging
        res.status(500).send({ message: "Error creating parent user", error: error.message });
    }
};

