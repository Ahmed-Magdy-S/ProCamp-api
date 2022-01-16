const mongoose = require("mongoose")

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, "Please add a title fot the review"],
        maxlength: [100, "You cannot add more than 100 characters"]
    },
    text: {
        type: String,
        required: [true, "Please add some text"]
    },
    rating: {
        type: Number,
        min: [1, "You cannot enter less than 1 point"],
        max: [10, "You cannot enter than 10 points"],
        required: [true, "Please add rating between 1 and 10"]
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: "Bootcamp",
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    }


}, {
    timestamps: true
})

//prevent user for submitting more than one review per bootcamp
ReviewSchema.index({ user: 1, bootcamp: 1 }, { unique: true })

//get average rating
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
    const aggregate = await this.aggregate([
        { $match: { bootcamp: bootcampId } },
        { $group: { _id: '$bootcamp', averageRating: { $avg: "$rating" } } }
    ])

    try {
        await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
            averageRating: aggregate[0].averageRating
        })
    } catch (error) {
        console.error(error)
    }

}


ReviewSchema.post("save", async function () {
    await this.constructor.getAverageRating(this.bootcamp)
})


ReviewSchema.pre("remove", async function () {
    await this.constructor.getAverageRating(this.bootcamp)
})




module.exports = mongoose.model("Review", ReviewSchema)