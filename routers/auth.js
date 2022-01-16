const router = require("express").Router()
const { register, login, getCurrentLoggedInUser, forgotPassword, resetPassword, logout } = require("../controllers/auth")
const { protect } = require("../middlewares/auth")


router.route("/register").post(register)
router.route("/login").post(login)
router.route("/logout").get(protect, logout)
router.route("/me").get(protect, getCurrentLoggedInUser)
router.route("/forgotpassword").post(forgotPassword)
router.route("/resetpassword/:resettoken").put(resetPassword)


module.exports = router