const express = require('express');
const passport = require('./config/passport');
const errorMiddleware = require('./middlewares/error.middleware');
const routes = require('./routes/index.routes');
const swagger = require('swagger-ui-express')
const morgan = require('morgan');
const swaggerSpec = require('./config/swagger')

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(passport.initialize());


app.use('/api', routes);
app.use('/api-docs', swagger.serve, swagger.setup(swaggerSpec));


app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorMiddleware);

module.exports = app;