const MessageMiddleware = (value, req, res, next) => {
    const statusCode = value.statusCode || 500;
    const message = value.message || "Internal Server error";
    const status = value.status || false;
    const data = value.data || [];
    const extraDetails = value.extraDetails || [];
    res.status(statusCode).json({
        message: message,
        status: status,
        statusCode: statusCode,
        data: data,
        extraDetails: extraDetails,
    });
}

module.exports = MessageMiddleware;