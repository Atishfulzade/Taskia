const jwt = require("jsonwebtoken");
const msg = require("../utils/message-constant.json");

const validateUser = (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: msg.tokenNotFound });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return res.status(403).json({ message: msg.invalidToken });
      }

      // Remove the password from the decoded user object before sending it
      const { password, ...userWithoutPassword } = decoded;

      // Token is valid, send user data excluding password
      res.status(200).json({
        message: msg.verificationSuccess,
        user: userWithoutPassword, // Send user data without password
      });
    });
  } catch (error) {
    res.status(500).json({ message: msg.serverError });
  }
};

module.exports = validateUser;
