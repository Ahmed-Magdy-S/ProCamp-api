const Bootcamp = require("../models/Bootcamp")
const ErrorResponse = require("../utils/ErrorResponse")
const geocoder = require("../utils/geocoder")
const asyncHandler = require("../middlewares/asyncHandler")
const path = require("path")
//@desc     Get all bootcamps
//@route    GET /api/v1/bootcamps
//@access   Public

const getBootcamps = asyncHandler(async (req, res, next) => {


    res.status(200).send(res.advancedResults)
})

//@desc     Get a single bootcamp
//@route    GET /api/v1/bootcamps/:id
//@access   Public

const getBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) return next(new ErrorResponse(404, `Bootcamp not found with id of ${req.params.id}`))

    res.status(200).send({ success: true, data: bootcamp })
})

//@desc     Create a new bootcamp
//@route    POST /api/v1/bootcamps
//@access   Private

const createBootcamp = asyncHandler(async (req, res, next) => {
    //checked for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id })

    //if the user is not admin, they can only add one bootcamp
    if (publishedBootcamp && req.user.role !== "admin") return next(new ErrorResponse(403, "You are not authorized to create more than one bootcamp"))

    const bootcamp = await Bootcamp.create({ ...req.body, user: req.user.id })
    res.status(201).send({ success: true, data: bootcamp })


})

//@desc     Update a bootcamp
//@route    PUT /api/v1/bootcamps/:id
//@access   Private

const updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) return next(new ErrorResponse(404, `Bootcamp not found with id of ${req.params.id}`))

    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(401, "You are not authorized to update this bootcamp"))
    }
    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).send({ success: true, data: bootcamp })
})

//@desc     Delete a bootcamp
//@route    DELETE /api/v1/bootcamps/:id
//@access   Private
const deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) return next(new ErrorResponse(404, `Bootcamp not found with id of ${req.params.id}`))

    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(401, "You are not authorized to delete this bootcamp"))
    }

    bootcamp.remove()
    res.status(200).send({ success: true })

})

//@desc     Get a bootcamp within a radius
//@route    GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access   public
const getBootcampsWithinRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params

    const loc = await geocoder.geocode(zipcode)
    const longitude = loc[0].longitude
    const latitude = loc[0].latitude

    //calculate radius using radians
    //divide distance by radius of earth
    //earth radius = 3963 mi / 6378 km
    const radius = distance / 3963

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[longitude, latitude], radius] } }
    })

    res.status(200).send({ success: true, count: bootcamps.length, data: bootcamps })

})


//@desc     Upload Photo to bootcamp
//@route    PUT /api/v1/bootcamps/:id/photo
//@access   Private
const bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) return next(new ErrorResponse(404, `Bootcamp not found with id of ${req.params.id}`))

    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(401, "You are not authorized to update this bootcamp"))
    }

    if (!req.files) return next(new ErrorResponse(400, "Please Upload a photo"))

    const file = req.files.file

    if (!file.mimetype.startsWith("image")) return next(new ErrorResponse(400, "The file must be a photo"))

    if (file.size > process.env.MAX_FILE_SIZE) return next(new ErrorResponse(400, `The image should be less than ${process.env.MAX_FILE_SIZE / 1000000}mg`))

    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
    console.log(file.name)

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(500, "Problem with file upload"))
        }
    })

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })

    res.status(200).send({ success: true, data: file.name })

})


module.exports = {
    getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsWithinRadius, bootcampPhotoUpload
} 