
// status code 200: OK [success]
const commonSuccess = (message, data, extraDetails) => {
    return{
        statusCode: 200,
        status: true,
        message: message,
        data: data,
        extraDetails: extraDetails || null,
    };
};

// status code 201: Created [new item created successfully]
const commonItemCreated = (message, data, extraDetails) => {
    return{
        statusCode: 201,
        status: true,
        message: message,
        data: data,
        extraDetails: extraDetails || null,
    };
};

// status code 204: No Content [no content]
const commonNoContent = (message, extraDetails) => {
    return{
        statusCode: 204,
        status: true,
        message: message,
        extraDetails: extraDetails || null,
    };
};

// status code 304: Not Modified [not modified]
const commonNotModified = (message, extraDetails) => {
    return{
        statusCode: 304,
        status: true,
        message: message,
        extraDetails: extraDetails || null,
    };
};

// status code 400: Bad Request [invalid input]
const commonBadRequest = (message, error) => {
    return{
        statusCode: 400,
        status: false,
        message: message,
        extraDetails: error || null,
    };
};

// status code 409: Conflict [item already exists]
const commonAlreadyExists = (message, extraDetails) => {
    return{
        statusCode: 409,
        status: false,
        message: message,
        extraDetails: extraDetails || null,
    };
};

// status code 401: Unauthorized [unauthorized call]
const commonUnauthorizedCall = (error) => {
    return{
        statusCode: 401,
        status: false,
        message: "Unauthorized",
        extraDetails: error,
    };
};

// status code 404: Not Found [item not found]
const commonItemNotFound = (message, extraDetails) => {
    return{
        statusCode: 404,
        status: false,
        message: message,
        extraDetails: extraDetails || null,
    };
}; 

// status code 500: Internal Server Error [internal server error]
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
    commonAlreadyExists,
    commonNoContent,
    commonNotModified
};