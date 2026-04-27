require('dotenv').config();
const { sendWelcomeEmail } = require('./src/utils/emailService');

async function test() {
    console.log('Testing email service...');
    console.log('User:', process.env.EMAIL_USER);

    const result = await sendWelcomeEmail('shaikbaaji27@gmail.com', 'Test User');
    if (result) {
        console.log('Email sent successfully!');
    } else {
        console.log('Email failed to send.');
    }
}

test();
