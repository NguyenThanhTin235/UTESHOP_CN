require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const requestId = require('./middleware/requestId');
const rateLimit = require('express-rate-limit');

const app = express();

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    code: 429,
    message: 'Bạn đã yêu cầu quá nhiều lần, vui lòng thử lại sau 15 phút',
    timestamp: Math.floor(Date.now() / 1000)
  }
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(requestId);
app.use('/api', limiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    code: statusCode,
    message: err.message || 'Internal Server Error',
    data: null,
    errors: err.errors || null,
    requestId: req.id,
    timestamp: Math.floor(Date.now() / 1000)
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
