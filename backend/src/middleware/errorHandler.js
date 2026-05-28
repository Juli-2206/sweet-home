function errorHandler(err, req, res, next) {
  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  console.error(`[ERROR] ${req.method} ${req.path} (${status}):`, message);

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
