const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODBURI, {});
        console.log('MongoDB connection SUCCESS');
    } catch (error) {
        console.log('MongoDB connection FAIL');
        process.exit(1);
    }
};

module.exports = connectDB;