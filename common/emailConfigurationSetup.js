const nodemailer = require('nodemailer');

require('dotenv').config(); // Load environment variables from .env file

// Create a transporter object with your email service provider's configuration
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    secure: false,
    port: 587,
    auth: {
        user: process.env.EMAIL_USERNAME, 
        pass: process.env.EMAIL_PASSWORD, 
    },
});

module.exports = transporter;