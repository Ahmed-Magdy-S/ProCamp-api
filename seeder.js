require("dotenv").config({ path: "./config/config.env" })


const fs = require("fs")
const mongoose = require("mongoose")
const colors = require("colors")
const Bootcamp = require("./models/Bootcamp")
const Course = require("./models/Course")
const User = require("./models/User")
const Review = require("./models/Review")




mongoose.connect(process.env.MONGO_URI);

const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'))
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'))

//Import Into DB
const importData = async () => {
    console.log("Importing Data ...".blue)
    try {
        await Bootcamp.create(bootcamps)
        console.log("Bootcamps data have been imported".green)
        await Course.create(courses)
        console.log("Courses data have been imported".green)
        await User.create(users)
        console.log("Users data have been imported".green)
        await Review.create(reviews)
        console.log("Reviews data have been imported".green)

        console.log("All Done".blue)
        process.exit()
    } catch (error) {
        console.error(error)
    }
}

//Delete  Data from DB
const deleteData = async () => {
    console.log("Destroying Data...".yellow)

    try {
        await Bootcamp.deleteMany()
        console.log("Bootcamps data have been destroyed".red)
        await Course.deleteMany()
        console.log("Courses data have been destroyed".red)
        await User.deleteMany()
        console.log("Users data have been destroyed".red)
        await Review.deleteMany()
        console.log("Reviews data have been destroyed".red)


        console.log("Done".blue)
        process.exit()
    } catch (error) {
        console.error(error)
    }
}

if (process.argv[2] === "-i") {
    importData()
}

else if (process.argv[2] === "-d") {
    deleteData()
}

