class ErrorResponse extends Error {
    constructor(statusCode, message) {
        super(message)
        this.statusCode = statusCode
    }
}
module.exports = ErrorResponse