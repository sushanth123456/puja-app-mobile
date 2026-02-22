const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const bookingRoutes = require('./routes/bookings');
const { errorHandler } = require('./middleware/error-handler');
const { requireHttpsInProduction } = require('./middleware/https-only');

const app = express();

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (config.corsAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS origin blocked.'));
  },
  credentials: true,
};

app.use(helmet());
app.use(morgan('combined'));
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(requireHttpsInProduction);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use(profileRoutes);
app.use(bookingRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use(errorHandler);

module.exports = app;
