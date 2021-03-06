const express = require('express');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

// Route declaration
const userRoutes = require('./api/Routes/userRoutes');
const budgetRoutes = require('./api/Routes/budgetRoutes');
const pptxRoutes = require('./api/Routes/pptxRoutes');
const awsRoutes = require('./api/Routes/awsRoutes');

// Error handler
const globalErrHandler = require('./api/Controllers/errorController');
const AppError = require('./api/Helpers/appError');

const app = express();

// Allow All Cross-Origin request
app.use(cors());
// Set security HTTP headers
app.use(helmet());
// Limit requests
const limiter = rateLimit({
    max: 150,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, try again in an hour'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Data sanitization against Nosql query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());
// Prevent parameter pollution
app.use(hpp());

// Routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/budget', budgetRoutes);
app.use('/api/v1/pptx', pptxRoutes);
app.use('/api/v1/aws', awsRoutes);

// Handler for undefined routes
app.use('*', (req,res,next) => {
    const err = new AppError(404,'Not Found','Undefined route.');
    next(err,req,res,next);
});
app.use(globalErrHandler);

module.exports = app;
