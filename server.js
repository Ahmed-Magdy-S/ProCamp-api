const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan")
const connectDB = require("./config/db")
const colors = require("colors")
const errorHandler = require("./middlewares/error")
const fileUpload = require("express-fileupload")
const path = require("path")
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit')
const cors = require('cors')

//load env vars
dotenv.config({ path: "./config/config.env" })

//Load Routers
const bootcampsRouter = require("./routers/bootcamps")
const coursesRouter = require("./routers/courses")
const authRouter = require("./routers/auth")
const usersRouter = require("./routers/users")
const reviewsRouter = require("./routers/reviews")

const app = express()
app.use(cookieParser());
//dev logging middleware
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"))
}

//body parser middleware
app.use(express.json())

//File Uploading
app.use(fileUpload())

//sanitize data and prevent nosql injection
app.use(mongoSanitize())
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
app.use(limiter) // Apply the rate limiting middleware to all requests
app.use(cors()) //for cross origin resource security
app.use(express.static(path.join(__dirname, "public")))

//mount routers
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/bootcamps", bootcampsRouter)
app.use("/api/v1/courses", coursesRouter)
app.use("/api/v1/users", usersRouter)
app.use("/api/v1/reviews", reviewsRouter)
//error handler middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5000

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`The server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.magenta.bold)
    })
}).catch((e) => {
    console.log("The server cannot be run due to some problem at a connection to db".bgRed.white.bold)
})