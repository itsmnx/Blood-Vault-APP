const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate Entry',
      details: 'A record with this value already exists'
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;