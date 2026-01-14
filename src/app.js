const express = require('express');
const app = express();
require('dotenv').config();

// Global Middleware
app.use(express.json())

if (process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', true);
}
const createRateLimiter = require("./middleware/rateLimit");
app.use(createRateLimiter(1, 70, void 0, {

}))
// Routes
const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

// Error Handling Middleware
const errorHandler = require('./middleware/error');
app.use(errorHandler);


module.exports = app;