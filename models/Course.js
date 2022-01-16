const mongoose = require("mongoose")

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        require: [true, "Please add a course title"]
    },
    description: {
        type: String,
        required: [true, "Please add a description"]
    },
    weeks: {
        type: String,
        required: [true, "Please add number of weeks"]
    },
    tuition: {
        type: Number,
        required: [true, "Please add tuition"]
    },
    minimumSkill: {
        type: String,
        required: [true, "Please add minumum skills needed"],
        enum: ["beginner", "intermediate", "advanced"]
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
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

CourseSchema.statics.getAverageCost = async function (bootcampId) {
    const aggregate = await this.aggregate([
        { $match: { bootcamp: bootcampId } },
        { $group: { _id: '$bootcamp', averageCost: { $avg: "$tuition" } } }
    ])

    try {
        await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
            averageCost: aggregate[0].averageCost
        })
    } catch (error) {
        console.error(error)
    }

}


CourseSchema.post("save", async function () {
    await this.constructor.getAverageCost(this.bootcamp)
})


CourseSchema.pre("remove", async function () {
    await this.constructor.getAverageCost(this.bootcamp)
})





module.exports = mongoose.model("Course", CourseSchema)