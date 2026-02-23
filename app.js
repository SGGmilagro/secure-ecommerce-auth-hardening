const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv/config');

const app = express();

// 🔐 NEW explicit JWT middleware
const requireAuth = require('./helpers/requireAuth');
const errorHandler = require('./helpers/error-handler');

app.use(cors());
app.options('*', cors());

// Middlewares
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('tiny'));

// Static folder (public uploads)
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

const api = process.env.API_URL;

const categoriesRoute = require('./routes/categories');
const productRoute = require('./routes/products');
const userRoute = require('./routes/users');
const orderRoute = require('./routes/orders');

// 🔓 Public routes
app.use(`${api}/products`, productRoute);
app.use(`${api}/categories`, categoriesRoute);
app.use(`${api}/users`, userRoute);

// 🔒 Protected routes (JWT required)
app.use(`${api}/orders`, requireAuth, orderRoute);

// Error handling middleware (must be last)
app.use(errorHandler);

// Database connection
const dbConfig = require('./config/database.config.js');

mongoose.Promise = global.Promise;

mongoose.set('strictQuery', true);

mongoose.connect(dbConfig.url)
    .then(() => {
        console.log("Successfully connected to the database");
    })
    .catch(err => {
        console.log('Could not connect to the database. Exiting now...', err);
        process.exit(1);
    });

module.exports = app;
