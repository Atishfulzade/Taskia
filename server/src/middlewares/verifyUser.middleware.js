const jwt = require("jsonwebtoken"); // Use require to import jwt
const msg = require("../utils/message-constant.json"); // Use require for your JSON import
const { handleError, handleResponse } = require("../utils/common-functions");

const verifyUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return handleResponse(res, 401, false, msg.authentication.tokenNotFound);
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return handleResponse(res, 403, false, msg.authentication.invalidToken);
      }
      req.user = decoded; // Attach the decoded user data to the request object
      next(); // Proceed to the next middleware or route handler
    });
  } catch (error) {
    handleError(res, msg.errorFetchingToken, error); // Handle unexpected errors
  }
};

module.exports = { verifyUser };
