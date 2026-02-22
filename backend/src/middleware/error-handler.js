function errorHandler(error, _req, res, _next) {
  if (error.name === 'ZodError') {
    return res.status(400).json({
      message: 'Validation failed.',
      details: error.issues.map((issue) => issue.message),
    });
  }
  const status = error.statusCode || 500;
  const message = error.message || 'Internal server error.';
  return res.status(status).json({ message });
}

module.exports = { errorHandler };
