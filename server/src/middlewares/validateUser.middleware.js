const jwt = require("jsonwebtoken");
const msg = require("../utils/message-constant.json");
const User = require("../models/user.model");
const { handleError, handleResponse } = require("../utils/common-functions");

const validateUser = async (req, res) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.log("No token provided"); // Debug log
      return handleResponse(res, 401, false, msg.authentication.tokenNotFound);
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      console.log("Invalid token or missing ID", decoded); // Debug log
      return handleResponse(res, 403, false, msg.authentication.invalidToken);
    }

    // Fetch user from database
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("User not found for ID:", decoded.id); // Debug log
      return handleResponse(res, 404, false, msg.user.userNotFound);
    }

    console.log("User found:", user); // Debug log

    // Return success response with user data
    return handleResponse(res, 200, msg.authentication.verificationSuccess, {
      data: { user },
    });
  } catch (error) {
    console.error("Error validating user:", error); // Debug log
    return handleError(res, msg.serverError, error);
  }
};

module.exports = validateUser;
