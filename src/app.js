const express = require('express');
const cookieParser = require("cookie-parser");
const app = express();
require('dotenv').config();
// Global Middleware
app.use(express.json());
app.use(cookieParser());

// Rate Limit Middleware
const createRateLimiter = require("./middleware/rateLimit");
app.use(createRateLimiter(1, 70, void 0)) // 60s w=70

// Parser Device Middleware
const parseDeviceMiddleware = require("./middleware/parserDevice");

// Routes
const authRoutes = require('./routes/auth.routes');
app.use('/auth', parseDeviceMiddleware, authRoutes);

// Error Handling Middleware
const errorHandler = require('./middleware/error');
app.use(errorHandler);


module.exports = app;