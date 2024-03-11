
// status code 200: OK
const commonSuccess = (message, data, extraDetails) => {
    return{
        statusCode: 200,
        status: true,
        message: message,
        data: data,
        extraDetails: extraDetails || null,
    };
};

// status code 201: Created
const commonItemCreated = (message, data, extraDetails) => {
    return{
        statusCode: 201,
        status: true,
        message: message,
        data: data,
        extraDetails: extraDetails || null,
    };
};
// status code 400: Bad Request
const commonBadRequest = (message, error) => {
    return{
        statusCode: 400,
        status: false,
        message: message,
        extraDetails: error || null,
    };
};

// status code 401: Unauthorized
const commonUnauthorizedCall = (error) => {
    return{
        statusCode: 401,
        status: false,
        message: "Unauthorized",
        extraDetails: error,
    };
};

// status code 404: Not Found
const commonItemNotFound = (message, extraDetails) => {
    return{
        statusCode: 404,
        status: false,
        message: message,
        extraDetails: extraDetails || null,
    };
}; 

// status code 500: Internal Server Error
const commonCatchBlock = (error, extraDetails) => {
    return{
        statusCode: 500,
        status: false,
        message: "Internal Server Error",
        extraDetails: error,
    };
};

module.exports = {
    commonSuccess,
    commonItemCreated,
    commonItemNotFound,
    commonCatchBlock,
    commonBadRequest,
    commonUnauthorizedCall,
};