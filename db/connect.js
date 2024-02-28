const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODBURI, {});
        console.log('MongoDB connection SUCCESS');
    } catch (error) {
        console.log('MongoDB connection FAIL, Check the IP Address on mongodb website or check the connection string in .env file.');
        process.exit(1);
    }
};

module.exports = connectDB;