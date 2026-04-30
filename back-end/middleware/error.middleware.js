const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(err);

  // Invalid MongoDB ObjectId
  if (err.name === 'CastError') {
    error = new Error('Resource not found')
    error.statusCode = 404
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    error = new Error(`Duplicate value entered for ${field}`)
    error.statusCode = 400
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ')
    error = new Error(message)
    error.statusCode = 400
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
};

export default errorMiddleware
