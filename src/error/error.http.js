var httpError = {};

httpError.throw = function (statusCode, message) {
    var error = new Error(message);
    error.status = statusCode;
    throw error;
};

httpError.handle = function (response) {
    return function (error) {
        if (error.name === 'CastError') {
            response.status(400);
        } else if (error.status) {
            response.status(error.status);
        } else {
            response.status(500);
            console.log(error);
        }
        response.send({message: error.message});
    };
};

module.exports = httpError;