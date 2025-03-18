const User = require("../models/user.model.js");
const { handleError, handleResponse } = require("../utils/common-functions.js");
const msg = require("../utils/message-constant.json");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { default: mongoose } = require("mongoose");

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    // Check if required fields are provided
    if (!email || !name || !password) {
      return handleResponse(res, 400, msg.user.allFieldsRequired);
    }

    // Check if the user already exists
    const isExist = await User.findOne({ email });
    if (isExist) {
      return handleResponse(res, 400, msg.user.userAlreadyExists);
    }

    // Check if the password is too short
    if (password.length < 6) {
      return handleResponse(res, 401, msg.user.passwordTooShort);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ email, name, password: hashedPassword });

    // Generate a JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save the new user to the database
    await newUser.save();

    // Return success response with the new user and token
    return handleResponse(res, 200, msg.authentication.registerationsSuccess, {
      user: { ...newUser.toObject(), password: undefined },
      token,
    });
  } catch (error) {
    // Handle error and return error response
    handleError(res, msg.authentication.registerationsFailure, error);
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if required fields are provided
    if (!email || !password) {
      return handleResponse(res, 400, msg.allFieldsRequired);
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return handleResponse(res, 401, msg.user.userNotExists);
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return handleResponse(res, 401, msg.authentication.invalidCredentials);
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save the user ID in the session
    req.session.userId = user._id;
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return handleResponse(res, 500, msg.authentication.sessionSaveFailed);
      }

      // Return success response with the user and token
      return handleResponse(res, 200, msg.authentication.loginSuccess, {
        user: { ...user.toObject(), password: undefined }, // Exclude password from the response
        token,
      });
    });
  } catch (error) {
    // Handle error and return error response
    handleError(res, msg.authentication.loginFailure, error);
  }
};

// Logout user
const logOutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return handleError(res, msg.authentication.logoutFailure, err);
    }

    res.clearCookie("connect.sid", { path: "/" });

    // Return success response
    return handleResponse(res, 200, msg.authentication.logoutSuccess);
  });
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID and exclude the password field
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return handleResponse(res, 404, msg.user.userNotFound);
    }

    // Return success response with the user data
    return handleResponse(res, 200, msg.user.userFetched, user);
  } catch (error) {
    // Handle error and return error response
    handleError(res, msg.user.errorFetchingUser, error);
  }
};

// Search users by name
const getAllUser = async (req, res) => {
  try {
    const term = req.query.name?.trim() || ""; // Ensure term is not undefined and remove spaces
    const query = term
      ? { name: { $regex: `.*${term}.*`, $options: "i" } }
      : {};

    const users = await User.find(query);

    if (!users.length) {
      return handleResponse(res, 404, "No users found");
    }

    return handleResponse(res, 200, "Users fetched successfully", { users });
  } catch (error) {
    // Handle error and return error response
    handleError(res, "Error fetching users", error);
  }
};

// Add a notification to a user
const addNotification = async (req, res) => {
  const userId = req.user.id;
  try {
    const { title, type } = req.body;

    if (!userId) {
      return handleResponse(res, 400, "User ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return handleResponse(res, 400, "Invalid User ID");
    }

    // Construct the notification object
    const notification = {
      message: String(title || ""),
      type: String(type || "info"),
      createdAt: new Date(),
    };

    // Update user document: Push notification into the array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { notifications: notification } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return handleResponse(res, 404, "User not found");
    }

    return handleResponse(res, 200, "Notification added successfully", {
      notifications: updatedUser.notifications,
    });
  } catch (error) {
    // Handle error and return error response
    handleError(res, "Internal Server Error", error);
  }
};

// Delete a notification from a user
const deleteNotification = async (req, res) => {
  try {
    const { userId, notificationId } = req.body;

    if (!userId || !notificationId) {
      return handleResponse(
        res,
        400,
        "User ID and Notification ID are required"
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(notificationId)
    ) {
      return handleResponse(res, 400, "Invalid User ID or Notification ID");
    }

    // Update the user document: Pull the specific notification out of the notifications array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { notifications: { _id: notificationId } } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return handleResponse(res, 404, "User not found");
    }

    return handleResponse(res, 200, "Notification deleted successfully", {
      notifications: updatedUser.notifications,
    });
  } catch (error) {
    // Handle error and return error response
    handleError(res, "Internal Server Error", error);
  }
};

// Get notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return handleResponse(res, 404, "User not found");
    }

    return handleResponse(res, 200, "Notifications fetched successfully", {
      notifications: user.notifications,
    });
  } catch (error) {
    // Handle error and return error response
    handleError(res, "Internal Server Error", error);
  }
};

module.exports = {
  registerUser,
  addNotification,
  loginUser,
  logOutUser,
  getUserNotifications,
  getAllUser,
  getUserById,
  deleteNotification,
};
