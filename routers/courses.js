const router = require("express").Router({ mergeParams: true })
const { getCourses, getCourse, addCourse, updateCourse, deleteCourse } = require("../controllers/courses")
const advancedResults = require("../middlewares/advancedResults")
const Course = require("../models/Course")
const { protect, authorize } = require("../middlewares/auth")


const populate = {
    path: "bootcamp",
    select: "name description"
}

router.route('/').get(advancedResults(Course, populate), getCourses).post(protect, authorize("publisher", "admin"), addCourse)
router.route("/:id").get(getCourse).put(protect, authorize("publisher", "admin"), updateCourse).delete(protect, authorize("publisher", "admin"), deleteCourse)


module.exports = router