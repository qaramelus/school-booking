
const User = require('../models/User');
const { encryptPassword } = require('../middlewares/authMiddleware'); 


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
        .populate('parent', 'username email role', null, { strictPopulate: false })
        .populate('children', 'username email role', null, { strictPopulate: false });
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
        // Create a new instance of the User model with encrypted password
        const childUser = new User({
            ...childUserInfo,
            parent: parentId,
            role: 'child',
            password: req.body.encryptedPassword 
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
        console.log("Request Body:", teacherUserInfo); // Log request body

        if (!teacherUserInfo.role || teacherUserInfo.role !== 'teacher') {
            return res.status(400).send({ message: "Role must be specified as 'teacher'." });
        }

        // Assuming the middleware has correctly set the username
        if (!teacherUserInfo.username) {
            return res.status(400).send({ message: "Username could not be generated." });
        }

        // Create a new instance of the User model with encrypted password
        const teacherUser = new User({
            ...teacherUserInfo,
            username: teacherUserInfo.username, 
            password: req.body.encryptedPassword , 
        });

        await teacherUser.save();

        res.status(201).send({ message: "Teacher user created successfully", teacherUser });
    } catch (error) {
        console.error("Error in createTeacherUser:", error);
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
    const parentUserInfo = {
        ...req.body,
        role: 'parent'
    };

    try {
        // Create a new instance of the User model with encrypted password
        const parentUser = new User({
            ...parentUserInfo,
            password: req.body.encryptedPassword  
        });

        await parentUser.save();
        res.status(201).send({ message: "Parent user created successfully", parentUser });
    } catch (error) {
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

  exports.updateTeacherUser = async (req, res) => {
    const teacherId = req.params.teacherId;
    const updatedTeacherInfo = req.body;
  
    try {
      const user = await User.findById(teacherId);
  
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
  
      // Update the user's fields
      user.firstName = updatedTeacherInfo.firstName || user.firstName;
      user.lastName = updatedTeacherInfo.lastName || user.lastName;
      user.email = updatedTeacherInfo.email || user.email;
      if (req.body.encryptedPassword) { // Only update password if it's been re-encrypted
        user.password = req.body.encryptedPassword;
      }
  
      await user.save();
  
      res.status(200).send({ message: "User updated successfully", user });
    } catch (error) {
      res.status(500).send({ message: "Error updating user", error: error.message });
    }
  };

  exports.updateAdminUser = async (req, res) => {
    try {
        const adminId = req.params.adminId;
        const updatedAdminInfo = req.body;

        const adminUser = await User.findById(adminId);
        if (!adminUser) {
            return res.status(404).send({ message: "Admin user not found" });
        }

        // Update the admin user fields
        adminUser.set(updatedAdminInfo);
        const updatedUser = await adminUser.save();

        res.status(200).send({ message: "Admin user updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).send({ message: "Error updating admin user", error: error.message });
    }
};

exports.updateChildUser = async (req, res) => {
    try {
        const parentId = req.params.parentId;
        const childId = req.params.childId;

        const childUser = await User.findOne({ _id: childId, parent: parentId });
        if (!childUser) {
            return res.status(404).send({ message: "Child user not found" });
        }

        const updatedChildInfo = req.body;
        // Update child-specific fields
        childUser.set(updatedChildInfo);
        await childUser.save();

        res.status(200).send({ message: "Child user updated successfully", user: childUser });
    } catch (error) {
        res.status(500).send({ message: "Error updating child user", error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (req.user.role !== 'admin') {
            return res.status(403).send({ message: "Unauthorized: Only admins can delete users." });
        }

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        res.send({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: "Error deleting user", error: error.message });
    }
};

exports.getUserInitials = (user) => {
    if (!user || !user.firstName || !user.lastName) {
        return '';
    }
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
};

exports.fetchUserInitials = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        const initials = exports.getUserInitials(user); 
        res.send({ initials });
    } catch (error) {
        res.status(500).send({ message: "Error fetching user initials", error: error.message });
    }
};
