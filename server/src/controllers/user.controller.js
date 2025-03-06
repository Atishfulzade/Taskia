const User = require("../models/user.model.js");
const { handleError, handleResponse } = require("../utils/common-functions.js");
const msg = require("../utils/message-constant.json");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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

    // Return success response with the user and token
    return handleResponse(res, 200, msg.authentication.loginSuccess, {
      user: { ...user.toObject(), password: undefined },
      token,
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
    res.clearCookie("connect.sid");
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
  console.log("Query Parameters:", req.query);
  try {
    const term = req.query.name || ""; // Ensure term is not undefined
    const query = term ? { name: { $regex: term, $options: "i" } } : {};

    console.log("MongoDB Query:", query);

    const users = await User.find(query);
    console.log("Fetched Users:", users);

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    return res
      .status(200)
      .json({ message: "Users fetched successfully", users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Error fetching users", error });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logOutUser,
  getAllUser,
  getUserById,
};
