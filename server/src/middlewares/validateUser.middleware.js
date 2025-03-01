const jwt = require("jsonwebtoken");
const msg = require("../utils/message-constant.json");
const User = require("../models/user.model");

const validateUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: msg.tokenNotFound });
    }

    // Verify token synchronously using await
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(403).json({ message: msg.invalidToken });
    }
    // console.log(decoded);
    // Fetch user from database
    const user = await User.findById(decoded.id).select("-password"); // Exclude password
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: msg.userNotFound });
    }

    res.status(200).json({
      message: msg.verificationSuccess,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: msg.serverError });
  }
};

module.exports = validateUser;
