const config = require('../config');

function requireHttpsInProduction(req, res, next) {
  if (config.nodeEnv !== 'production') {
    return next();
  }
  const forwardedProto = req.headers['x-forwarded-proto'];
  if (req.secure || forwardedProto === 'https') {
    return next();
  }
  return res.status(403).json({ message: 'HTTPS is required in production.' });
}

module.exports = { requireHttpsInProduction };
