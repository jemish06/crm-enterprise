const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const leadRoutes = require('./routes/leads');
const contactRoutes = require('./routes/contacts');
const dealRoutes = require('./routes/deals');
const taskRoutes = require('./routes/tasks');
const companyRoutes = require('./routes/companies');
const activityRoutes = require('./routes/activities');
const dashboardRoutes = require('./routes/dashboard');
const workflowRoutes = require('./routes/workflows');
const settingsRoutes = require('./routes/settings');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL injection

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
const API_VERSION = process.env.API_VERSION || 'v1';

app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, apiLimiter, userRoutes);
app.use(`/api/${API_VERSION}/leads`, apiLimiter, leadRoutes);
app.use(`/api/${API_VERSION}/contacts`, apiLimiter, contactRoutes);
app.use(`/api/${API_VERSION}/deals`, apiLimiter, dealRoutes);
app.use(`/api/${API_VERSION}/tasks`, apiLimiter, taskRoutes);
app.use(`/api/${API_VERSION}/companies`, apiLimiter, companyRoutes);
app.use(`/api/${API_VERSION}/activities`, apiLimiter, activityRoutes);
app.use(`/api/${API_VERSION}/dashboard`, apiLimiter, dashboardRoutes);
app.use(`/api/${API_VERSION}/workflows`, apiLimiter, workflowRoutes);
app.use(`/api/${API_VERSION}/settings`, apiLimiter, settingsRoutes);

app.use('/api/v1/activities', require('./routes/activities'));
app.use('/api/v1/users', require('./routes/users'));



// 404 handler
app.use(errorHandler.notFound.bind(errorHandler));

// Global error handler
app.use(errorHandler.globalHandler.bind(errorHandler));

module.exports = app;
