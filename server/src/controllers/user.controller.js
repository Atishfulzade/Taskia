const User = require("../models/user.model.js");
const { handleError } = require("../utils/common-functions.js");
const msg = require("../utils/message-constant.json");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password)
      return res.status(400).json({ message: msg.allFieldsRequired });
    const isExist = await User.findOne({ email: email });
    if (isExist)
      return res.status(400).json({ message: msg.userAlreadyExists });
    if (password.length < 6)
      // Updated password length validation
      return res.status(401).json({ message: msg.passwordTooShort });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, name, password: hashedPassword });
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    await newUser.save();
    res.status(200).json({
      message: msg.registrationSuccess,
      data: newUser.toObject({
        versionKey: false,
        transform: (_, ret) => {
          delete ret.password;
          return ret;
        },
      }),
      token,
    });
  } catch (error) {
    handleError(res, msg.errorCreatingUser, error);
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: msg.allFieldsRequired });
    const user = await User.findOne({ email: email });
    if (!user) return res.status(401).json({ message: msg.userNotExists });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: msg.invalidCredentials });
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: msg.loginSuccess, // Fixed duplicate message key
      data: user.toObject({
        versionKey: false,
        transform: (_, ret) => {
          delete ret.password;
          return ret;
        },
      }),
      token,
    });
  } catch (error) {
    handleError(res, msg.loginFailure, error);
  }
};

// Logout user
const logOutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err)
      return res.status(500).json({ message: msg.logoutFailure, error: err });

    res.clearCookie("connect.sid");
    res.status(200).json({ message: msg.logoutSuccess });
  });
};

const getUserById = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: msg.userNotFound });
    res.status(200).json(user);
  } catch (error) {
    handleError(res, msg.errorFetchingUser, error);
  }
};

const getUserBySearch = async (req, res) => {
  try {
    const { term } = req.params;

    if (!term) {
      return res.status(400).json({ message: "Search query is required" });
      // Added return statement
    }

    const users = await User.find({ name: { $regex: term, $options: "i" } });

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
      // Added return statement
    }

    res.status(200).json(users);
  } catch (error) {
    handleError(res, "Error fetching user!", error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logOutUser,
  getUserBySearch,
  getUserById,
};
