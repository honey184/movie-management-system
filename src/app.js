const express = require('express');
const path = require('path');
const passport = require('./config/passport');
const errorMiddleware = require('./middlewares/error.middleware');
const routes = require('./routes/index.routes');
const webRoutes = require('./routes/web.routes');
const swagger = require('swagger-ui-express')
const morgan = require('morgan');
const swaggerSpec = require('./config/swagger')

require("./cron/cronLoader");

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', webRoutes);
app.use('/api', routes);
app.use('/api-docs', swagger.serve, swagger.setup(swaggerSpec));


app.use((req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ success: false, message: 'Route not found' });
    }

    return res.status(404).render('pages/not-found', {
        pageTitle: 'Page Not Found',
        currentPath: req.path
    });
});
app.use(errorMiddleware);

module.exports = app;
