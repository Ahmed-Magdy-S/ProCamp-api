const Course = require("../models/Course")
const ErrorResponse = require("../utils/ErrorResponse")
const asyncHandler = require("../middlewares/asyncHandler")
const Bootcamp = require("../models/Bootcamp")

//@desc     Get courses    
//@route    GET /api/v1/courses
//@route    GET /api/v1/bootcamps/:bootcampId/courses
//@access   Public

const getCourses = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId })
        res.status(200).send({ success: true, count: courses.length, data: courses })

    }
    else {
        res.status(200).send(res.advancedResults)
    }
})


//@desc     Get as single course    
//@route    GET /api/v1/courses/:id
//@access   Public

const getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: "bootcamp",
        select: "name description"
    })
    if (!course) return next(new ErrorResponse(404, `Course not found with the id ${req.params.id}`))


    res.status(200).send({ success: true, data: course })
})

//@desc     Add course    
//@route    POST /api/v1/bootcamps/:bootcampId/courses
//@access   Private

const addCourse = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if (!bootcamp) return next(new ErrorResponse(404, `The bootcamp is not found with the id ${req.params.id}`))

    //make sure the user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(401, "You are not authorized to add courses to this bootcamp"))
    }


    const course = await Course.create({ ...req.body, bootcamp: req.params.bootcampId, user: req.user.id })


    res.status(200).send({ success: true, data: course })
})

//@desc     update course    
//@route    PUT /api/v1/courses/:id
//@access   Private

const updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id)
    if (!course) return next(new ErrorResponse(404, `Course not found with the id ${req.params.id}`))

    //make sure the user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(401, "You are not authorized to update this course as you are not the owner"))
    }



    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true, runValidators: true
    })


    res.status(200).send({ success: true, data: course })
})

//@desc     delete course    
//@route    DELETE /api/v1/courses/:id
//@access   Private

const deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id)
    if (!course) return next(new ErrorResponse(404, `Course not found with the id ${req.params.id}`))
    
    //make sure the user is course owner
     if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(401, "You are not authorized to delete this course as you are not the owner"))
    }

    await course.remove()

    res.status(200).send({ success: true, data: {} })
})








module.exports = {
    getCourses, getCourse, addCourse, updateCourse, deleteCourse
}