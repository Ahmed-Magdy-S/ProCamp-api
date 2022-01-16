const ErrorResponse = require("../utils/ErrorResponse")

const errorHandler = async (err, req, res, next) => {
    let error = { ...err }
    error.message = err.message

    console.log(err)

    //Mongoose bad ObjectId
    if (err.name === "CastError") {
        const message = `Resource not found with id of ${err.value}`
        error = new ErrorResponse(404, message)
    }
    //Mongoose duplicate key

    if (err.code === 11000) {
        let str = ""
        for (let key in err.keyValue) {
            str = str + " " + key
        }
        error = new ErrorResponse(400, `Duplicate fields are entered:${str}`)
    }

    //validation errors of mongoose
    if (err.name == "ValidationError") {
        const message = Object.values(err.errors).map((value) => {
            return value.message
        })
        error = new ErrorResponse(400, message)
    }




    res.status(error.statusCode || 500).send({ success: false, error: error.message || "Server Error" })
}

module.exports = errorHandler