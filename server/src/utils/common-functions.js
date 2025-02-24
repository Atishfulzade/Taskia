const handleError = (res, message, error = null, status = 500) => {
  console.error(message, error);
  res
    .status(status)
    .json({ message, error: error ? error.message : undefined });
};

module.exports = { handleError };
