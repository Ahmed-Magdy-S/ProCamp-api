const mongoose = require("mongoose")

const connectDB = async () => {

    try {
        const connect = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB is connected successfully: ${connect.connection.host}`.cyan.bold)
    } catch (error) {
        console.log(`Unable to connect to MongoDB\n ${error.message}`.red.bold)
        throw error
    }
}


module.exports = connectDB