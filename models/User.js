const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"]
    },
    email: {
        type: String,
        required: [true, "Please add your email"],
        unique: [true, "This email is already registred"],
        validate: {
            validator: function (val) {
                return validator.isEmail(val)
            },
            message: "Please add a valid Email"
        }
    },
    role: {
        type: String,
        enum: ["user", "publisher"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minlength: [6, "The password should not be less than 6 characters"]
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date

}, {
    timestamps: true
})


//encrypt password
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) next()

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

//authentication token generation

UserSchema.methods.generateAuthToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_KEY, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

//Matching password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

//create reset password token
UserSchema.methods.generateResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString("hex")

    //set expire fot 10 minutes
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000

    //hash token
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    return resetToken
}


module.exports = mongoose.model("User", UserSchema)