const jwt = require("jsonwebtoken"); // Use require to import jwt
const msg = require("../utils/message-constant.json"); // Use require for your JSON import
const { handleError } = require("../utils/common-functions");

const verifyUser = (req, res, next) => {
  // if (req.session.userId) {
  //   req.user = { id: req.session.userId };
  //   return next();
  // }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: msg.tokenNotFound });

  try {
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) return res.status(403).json({ message: msg.invalidToken });
      req.user = decoded;
      next();
    });
  } catch (error) {
    handleError(res, msg.errorFetchingToken, error);
  }
};

module.exports = { verifyUser }; // Export using module.exports
