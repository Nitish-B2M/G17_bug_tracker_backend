const MessageMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const status = err.status || false;
    const data = err.data || [];
    const extraDetails = err.extraDetails || [];
    res.status(statusCode).json({
        message: message,
        status: status,
        data: data,
        extraDetails: extraDetails,
    });
}

module.exports = MessageMiddleware;