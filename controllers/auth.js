const User = require("../models/User")
const ErrorResponse = require("../utils/ErrorResponse")
const asyncHandler = require("../middlewares/asyncHandler")
const sendEmail = require("../utils/sendEmail")
const { sendTokenResponse } = require("../utils/sendTokenResponse")
const crypto = require("crypto")

//@desc     Register User
//@route    POST /api/v1/auth/register
//@access   Public

const register = asyncHandler(async (req, res, next) => {
    const { name, password, email, role } = req.body

    const user = await User.create({ name, email, password, role })

    sendTokenResponse(user, 200, res)
})


//@desc     User Login
//@route    POST /api/v1/auth/register
//@access   Public

const login = asyncHandler(async (req, res, next) => {
    const { password, email } = req.body

    if (!email || !password) return next(new ErrorResponse(400, "Please enter your email/password"))

    const user = await User.findOne({ email })

    if (!user) return next(new ErrorResponse(401, "Invalid email/password"))

    const isPasswordMatch = await user.matchPassword(password)
    if (!isPasswordMatch) return next(new ErrorResponse(400, "Invalid email/password"))

    sendTokenResponse(user, 200, res)
})

//@desc     Get Current Logged In User
//@route    GET /api/v1/auth/me
//@access   Private
const getCurrentLoggedInUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("-password")
    res.status(200).send({ success: true, data: user })
})

//@desc     Forgot Password
//@route    POST /api/v1/auth/forgotpassword
//@access   public
const forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    if (!user) return next(new ErrorResponse(404, "There is no user with this email"))

    //get reset token
    const resetToken = user.generateResetPasswordToken()

    await user.save()

    //create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`

    try {
        console.log("Sending Email.. .")
        await sendEmail({
            email: user.email,
            subject: "Reset Password",
            message
        })

        res.status(200).send({ success: true, data: "Email sent" })

    } catch (error) {
        console.error(error)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save()
        next(new ErrorResponse(500, "Email could not be sent"))
    }


})


//@desc     Reset Password
//@route    PUT /api/v1/auth/resetpassword/:resettoken
//@access   Public
const resetPassword = asyncHandler(async (req, res, next) => {
    //get hashed token
    const hashedResetToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex")

    const user = await User.findOne({ resetPasswordToken: hashedResetToken })


    if (!user || user.resetPasswordExpire < new Date(Date.now())) return next(new ErrorResponse(400, "Invalid Token"))

    user.password = req.body.password
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save()

    sendTokenResponse(user, 200, res)
})



//@desc     log user out/ clear cookie
//@route    GET /api/v1/auth/logout
//@access   Private
const logout = asyncHandler(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).send({ success: true })
})


module.exports = { register, login, getCurrentLoggedInUser, forgotPassword, resetPassword, logout }