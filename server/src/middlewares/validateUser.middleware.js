const jwt = require("jsonwebtoken");
const msg = require("../utils/message-constant.json");
const User = require("../models/user.model");
const { handleError, handleResponse } = require("../utils/common-functions");

const validateUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return handleResponse(res, 401, false, msg.authentication.tokenNotFound);
    }

    // Verify token synchronously using await
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return handleResponse(res, 403, false, msg.authentication.invalidToken);
    }

    // Fetch user from database
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return handleResponse(res, 404, false, msg.user.userNotFound);
    }

    // Return success response with user data
    return handleResponse(
      res,
      200,
      true,
      msg.authentication.verificationSuccess,
      user
    );
  } catch (error) {
    // Handle any errors that occur during the process
    return handleError(res, msg.serverError, error);
  }
};

module.exports = validateUser;
