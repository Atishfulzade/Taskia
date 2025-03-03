const handleError = (res, message, error = null, status = 500) => {
  console.error(message, error);
  res
    .status(status)
    .json({ message, error: error ? error.message : undefined });
};

const handleResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    message,
    data,
  });
};

module.exports = { handleError, handleResponse };
