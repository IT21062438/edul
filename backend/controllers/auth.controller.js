const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "1h", // 1 hour default
  });
};

// @desc    Register basic account info (Step 1)
// @route   POST /api/auth/register/basic
// @access  Public
exports.registerBasic = async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create user with basic info
    const user = await User.create({
      name,
      email,
      password,
      role,
      status: "pending",
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Basic registration successful. Please complete your profile.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Register basic error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// @desc    Complete school profile (Step 2)
// @route   POST /api/auth/register/school-profile
// @access  Public
exports.completeSchoolProfile = async (req, res) => {
  try {
    const { email, ...profileData } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "school") {
      return res.status(400).json({
        success: false,
        message: "Invalid role for this profile",
      });
    }

    // Add file paths if uploaded
    if (req.files) {
      if (req.files.registrationProof) {
        profileData.registrationProof = req.files.registrationProof[0].filename;
      }
      if (req.files.endorsementLetter) {
        profileData.endorsementLetter = req.files.endorsementLetter[0].filename;
      }
    }

    // If user was rejected, reset status to pending for re-verification
    if (user.status === "rejected") {
      profileData.status = "pending";
      profileData.rejectionReason = undefined; // Clear rejection reason
    }

    // Update user with school profile data
    Object.assign(user, profileData);
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message:
        "School profile completed successfully. Awaiting admin verification.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        schoolName: user.schoolName,
        organizationName: user.schoolName,
      },
    });
  } catch (error) {
    console.error("Complete school profile error:", error);
    res.status(500).json({
      success: false,
      message: "Profile completion failed",
      error: error.message,
    });
  }
};

// @desc    Complete donor profile (Step 2)
// @route   POST /api/auth/register/donor-profile
// @access  Public
exports.completeDonorProfile = async (req, res) => {
  try {
    const { email, ...profileData } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "donor") {
      return res.status(400).json({
        success: false,
        message: "Invalid role for this profile",
      });
    }

    // Add file path if uploaded
    if (req.file) {
      profileData.identityCertificate = req.file.filename;
    }

    // If user was rejected, reset status to pending for re-verification
    if (user.status === "rejected") {
      profileData.status = "pending";
      profileData.rejectionReason = undefined; // Clear rejection reason
    }

    // Update user with donor profile data
    Object.assign(user, profileData);
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message:
        "Donor profile completed successfully. Awaiting admin verification.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        organizationName: user.organizationName,
      },
    });
  } catch (error) {
    console.error("Complete donor profile error:", error);
    res.status(500).json({
      success: false,
      message: "Profile completion failed",
      error: error.message,
    });
  }
};

// @desc    Complete volunteer profile (Step 2)
// @route   POST /api/auth/register/volunteer-profile
// @access  Public
exports.completeVolunteerProfile = async (req, res) => {
  try {
    const { email, ...profileData } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "volunteer") {
      return res.status(400).json({
        success: false,
        message: "Invalid role for this profile",
      });
    }

    // Add file paths if uploaded
    if (req.files) {
      if (req.files.nicFront) {
        profileData.nicFront = req.files.nicFront[0].filename;
      }
      if (req.files.nicBack) {
        profileData.nicBack = req.files.nicBack[0].filename;
      }
    }

    // If user was rejected, reset status to pending for re-verification
    if (user.status === "rejected") {
      profileData.status = "pending";
      profileData.rejectionReason = undefined; // Clear rejection reason
    }

    // Update user with volunteer profile data
    Object.assign(user, profileData);
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message:
        "Volunteer profile completed successfully. Awaiting admin verification.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        fullName: user.fullName,
        vehicleType: user.vehicleType,
        availability: user.availability,
        skills: user.skills,
      },
    });
  } catch (error) {
    console.error("Complete volunteer profile error:", error);
    res.status(500).json({
      success: false,
      message: "Profile completion failed",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Prepare user data based on role
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      rejectionReason: user.rejectionReason,
    };

    // Add role-specific fields
    if (user.role === "school") {
      userData.schoolName = user.schoolName;
      userData.organizationName = user.schoolName;
    } else if (user.role === "donor") {
      userData.organizationName = user.organizationName;
    } else if (user.role === "volunteer") {
      userData.fullName = user.fullName;
      userData.vehicleType = user.vehicleType;
      userData.availability = user.availability;
      userData.skills = user.skills;
      userData.contactNumber = user.contactNumber;
      userData.address = user.address;
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user",
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = { ...req.body };
    delete fieldsToUpdate.password; // Don't allow password update here
    delete fieldsToUpdate.email; // Don't allow email change
    delete fieldsToUpdate.role; // Don't allow role change

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Profile update failed",
      error: error.message,
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select("+password");

    // Check current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Password change failed",
      error: error.message,
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // In a JWT-based system, logout is handled client-side by removing the token
    // But we can log this action or invalidate refresh tokens if implemented

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

// @desc    Get pending users for admin approval
// @route   GET /api/auth/pending-users
// @access  Private/Admin
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: "pending" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingUsers.length,
      users: pendingUsers,
    });
  } catch (error) {
    console.error("Get pending users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get pending users",
      error: error.message,
    });
  }
};

// @desc    Get all users (pending, verified, rejected) for admin
// @route   GET /api/auth/all-users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: allUsers.length,
      users: allUsers,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get all users",
      error: error.message,
    });
  }
};

// @desc    Approve user
// @route   PUT /api/auth/approve-user/:userId
// @access  Private/Admin
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.status = "verified";
    user.rejectionReason = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User approved successfully",
      user,
    });
  } catch (error) {
    console.error("Approve user error:", error);
    res.status(500).json({
      success: false,
      message: "User approval failed",
      error: error.message,
    });
  }
};

// @desc    Reject user
// @route   PUT /api/auth/reject-user/:userId
// @access  Private/Admin
exports.rejectUser = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.status = "rejected";
    user.rejectionReason = reason;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User rejected",
      user,
    });
  } catch (error) {
    console.error("Reject user error:", error);
    res.status(500).json({
      success: false,
      message: "User rejection failed",
      error: error.message,
    });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/auth/delete-user/:userId
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "User deletion failed",
      error: error.message,
    });
  }
};

// @desc    Get verified volunteers
// @route   GET /api/auth/volunteers
// @access  Public
exports.getVerifiedVolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({
      role: "volunteer",
      status: "verified",
    }).select(
      "name email fullName contactNumber address vehicleType availability skills createdAt"
    );

    res.status(200).json({
      success: true,
      count: volunteers.length,
      volunteers,
    });
  } catch (error) {
    console.error("Get volunteers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch volunteers",
      error: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};
