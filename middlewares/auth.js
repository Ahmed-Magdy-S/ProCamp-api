const jwt = require("jsonwebtoken")
const asyncHandler = require("./asyncHandler")
const ErrorResponse = require("../utils/ErrorResponse")
const User = require("../models/User")

//protect routes
const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {

        token = req.headers.authorization.split(" ")[1]
    }
    else if (req.cookies.token){
        token = req.cookies.token
    }
    if (!token) return next(new ErrorResponse(401, "Not Authorized to access this route"))

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        const user = await User.findById(decoded.id)
        if (!user) return next(new ErrorResponse(401, "Not Authorized to access this route"))
        req.user = user
        next()
    } catch (error) {
        return next(new ErrorResponse(401, "Not Authorized to access this route"))
    }
})

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) return next(new ErrorResponse(403, `User role ${req.user.role} is not authorized to access this route`))
        next()
    }
}



module.exports = {
    protect , authorize
}