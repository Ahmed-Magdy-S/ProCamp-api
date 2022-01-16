const mongoose = require("mongoose")
const validator = require("validator")
const slugify = require("slugify")
const geocoder = require("../utils/geocoder")

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 charcaters']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please add a description'],
        trim: true,
        maxlength: [500, 'Name cannot be more than 500 charcaters']
    },
    website: {
        type: String,
        validate: {
            validator: function (val) {
                return validator.isURL(val)
            },
            message: "Please use a valid URL"
        }
    },
    phone: {
        type: String,
        maxlength: [20, "Phone number cannot be longer than 20 characters"]
    },
    email: {
        type: String,
        validate: {
            validator: function (val) {
                return validator.isEmail(val)
            },
            message: "Please add a valid Email"
        }
    },
    address: {
        type: String,
        required: [true, "Please add an address"]
    },
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: "2dsphere"
        },
        formattedAddress: String,
        street: String,
        city: String,
        zipcode: String,
        state: String,
        country: String,
    },
    careers: {
        type: [String],
        require: true,
        enum: [
            "Web Development",
            "Mobile Development",
            "UI/UX",
            "Data Science",
            "Business",
            "Machine Learning",
            "Other"
        ]
    },
    averageRating: {
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: [10, "Rating cannot be more than 10"]
    },
    averageCost: Number,
    photo: {
        type: String,
        default: "no-photo.jpg"
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

//create a bootcamp slug from name
schema.pre("save", function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})

//geocoder and create location field

schema.pre("save", async function (next) {
    const loc = await geocoder.geocode(this.address)
    this.location = {
        type: "Point",
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        zipcode: loc[0].zipcode,
        state: loc[0].stateCode,
        country: loc[0].countryCode
    }
    next()
})

//cascade delete courses when a bootcamp is deleted
schema.pre("remove", async function (next) {
    await this.model("Course").deleteMany({bootcamp: this._id});
    next()
})

//Reverse Poplate with virtulas
schema.virtual("courses", {
    ref: "Course",
    localField: "_id",
    foreignField: "bootcamp"
})





module.exports = mongoose.model("Bootcamp", schema)
