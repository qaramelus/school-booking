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
            parent: parentId,
            role: 'child'
        });

        await childUser.save();
        await User.findByIdAndUpdate(parentId, { $push: { children: childUser._id } });

        res.status(201).send({ message: "Child user created successfully", childUser });
    } catch (error) {
        res.status(500).send({ message: "Error creating child user", error: error.message });
    }
};

exports.createTeacherUser = async (req, res) => {
    const teacherUserInfo = req.body;

    try {
        const teacherUser = new User({
            ...teacherUserInfo,
            role: 'teacher'
        });

        await teacherUser.save();

        res.status(201).send({ message: "Teacher user created successfully", teacherUser });
    } catch (error) {
        res.status(500).send({ message: "Error creating teacher user", error: error.message });
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

exports.updateParentUser = async (req, res) => {
    try {
      const parentId = req.params.parentId;
      const updatedParentInfo = req.body;
  
      // Find the parent user by ID
      const parentUser = await User.findById(parentId);
  
      if (!parentUser) {
        return res.status(404).send({ message: "Parent user not found" });
      }
  
      // Update the parent user fields
      parentUser.firstName = updatedParentInfo.firstName || parentUser.firstName;
      parentUser.lastName = updatedParentInfo.lastName || parentUser.lastName;
      parentUser.address = updatedParentInfo.address || parentUser.address;
      parentUser.phone = updatedParentInfo.phone || parentUser.phone;
      parentUser.email = updatedParentInfo.email || parentUser.email;
      // Update other fields as needed
  
      // Save the updated parent user
      const updatedUser = await parentUser.save();
  
      res.json(updatedUser);
    } catch (error) {
      res.status(500).send({ message: "Error updating parent user", error: error.message });
    }
  }