const router = require("express").Router()
const { protect, authorize } = require("../middlewares/auth")
const advancedResults = require("../middlewares/advancedResults")
const User = require("../models/User")
const { updateUserDetails, updateUserPassword, getUsers, getUser, createUser, updateUser, deleteUser } = require("../controllers/users")


router.route("/update").put(protect, updateUserDetails)
router.route("/updatepassword").put(protect, updateUserPassword)
router.use(protect)
router.use(authorize("admin"))
router.route("/").get(advancedResults(User), getUsers).post(createUser)
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser)

module.exports = router