const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.statusCode ? err.message : 'Internal Server Error';

    if (req.originalUrl.startsWith('/api')) {
        return res.status(statusCode).json({
            success: false,
            message
        });
    }

    return res.status(statusCode).render('pages/not-found', {
        pageTitle: 'Something Went Wrong',
        currentPath: req.path
    });
};

module.exports = errorHandler;
