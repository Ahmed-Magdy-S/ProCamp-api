const Review = require("../models/Review")
const ErrorResponse = require("../utils/ErrorResponse")
const asyncHandler = require("../middlewares/asyncHandler")
const Bootcamp = require("../models/Bootcamp")

//@desc     Get Reviews    
//@route    GET /api/v1/reviews
//@route    GET /api/v1/bootcamps/:bootcampId/reviews
//@access   Public

const getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId })
        res.status(200).send({ success: true, count: reviews.length, data: reviews })

    }
    else {
        res.status(200).send(res.advancedResults)
    }
})


//@desc     Get a single review    
//@route    GET /api/v1/reviews/:id
//@access   Public

const getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({ path: "bootcamp", select: "name description" })
    if (!review) return next(new ErrorResponse(404, "Review Not found"))

    res.status(200).send({ success: true, data: review })
})


//@desc     Add a Review   
//@route    POST /api/v1/bootcamps/:bootcampId/reviews
//@access   Private

const addReview = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if (!bootcamp) return next(new ErrorResponse(400, `There is no bootcamp with the id ${req.params.bootcampId} to add reviews to it`))

    req.body.user = req.user.id
    req.body.bootcamp = req.params.bootcampId

    const review = await Review.create(req.body)

    res.status(201).send({ success: true, data: review })
})


//@desc     Add a Review   
//@route    PUT /api/v1/reviews/:id
//@access   Private

const updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id)
    if (!review) return next(new ErrorResponse(404, "Review Not found"))

    if (req.user.id !== review.user.toString() && req.user.role !== "admin") return next(new ErrorResponse(401, "You must be the owner or the admin to make this action"))

    review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    res.status(200).send({ success: true, data: review })
})


//@desc     Delete a Review   
//@route    DELETE /api/v1/reviews/:id
//@access   Private

const deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id)
    if (!review) return next(new ErrorResponse(404, "Review Not found"))

    if (req.user.id !== review.user.toString() && req.user.role !== "admin") return next(new ErrorResponse(401, "You must be the owner or the admin to make this action"))

    await review.remove()

    res.status(200).send({ success: true, data: "Review is removed" })
})



module.exports = {
    getReviews, getReview, addReview, updateReview, deleteReview
}