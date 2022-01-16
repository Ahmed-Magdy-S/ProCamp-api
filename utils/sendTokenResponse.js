const sendTokenResponse = (user, statusCode, res) => {
    const token = user.generateAuthToken()
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 1000 * 60 * 60 * 24),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') {
        options.secure = true
    }

    res.status(statusCode).cookie("token", token, options).send({ success: true, token })
}

module.exports = {
    sendTokenResponse
}