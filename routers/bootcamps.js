const express = require("express")
const { bootcampPhotoUpload, getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsWithinRadius } = require("../controllers/bootcamps")
const router = express.Router()
const advancedResults = require("../middlewares/advancedResults")
const Bootcamp = require("../models/Bootcamp")
const { protect, authorize } = require("../middlewares/auth")




// Include Other Routers
const coursesRouter = require("./courses")
const reviewsRouter = require("./reviews")
//re-route
router.use("/:bootcampId/courses", coursesRouter)
router.use("/:bootcampId/reviews", reviewsRouter)

router.route("/radius/:zipcode/:distance").get(getBootcampsWithinRadius)
router.route("/").get(advancedResults(Bootcamp, "courses"), getBootcamps).post(protect, authorize("publisher", "admin"), createBootcamp)
router.route("/:id/photo").put(protect, authorize("publisher", "admin"), bootcampPhotoUpload)
router.route("/:id").get(getBootcamp).put(protect, authorize("publisher", "admin"), updateBootcamp).delete(protect, authorize("publisher", "admin"), deleteBootcamp)


module.exports = router