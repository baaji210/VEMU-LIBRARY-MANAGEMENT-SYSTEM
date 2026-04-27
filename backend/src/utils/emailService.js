const nodemailer = require('nodemailer');

/**
 * Sends a welcome email to the user after successful registration.
 * @param {string} userEmail - The recipient's email address.
 * @param {string} userName - The recipient's name.
 */
const sendWelcomeEmail = async (userEmail, userName) => {
    try {
        // Create a transporter using SMTP settings from environment variables
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail', // e.g., 'gmail'
            auth: {
                user: process.env.EMAIL_USER, // your email
                pass: process.env.EMAIL_PASS  // your email password or app password
            }
        });

        const mailOptions = {
            from: `"VEMU Digital Library" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Successfully Registered - VEMU Library',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #0b1f4a;">Welcome to VEMU Library!</h1>
                    </div>
                    <p>Dear <strong>${userName}</strong>,</p>
                    <p>You have registered successfully on the <strong>VEMU Digital Library Management System</strong>.</p>
                    <p>You can now log in to your account and explore our collection of 12,000+ books, reserve resources, and track your library activity.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #7c3aed; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Your Dashboard</a>
                    </div>
                    <p>If you have any questions, feel free to reply to this email or contact the library office.</p>
                    <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888888; text-align: center;">
                        VEMU Institute of Technology<br>
                        P. Kothakota, Chittoor, Andhra Pradesh, India
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Registration email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending registration email:', error);
        return false;
    }
};

/**
 * Sends an email to the student when their book request is accepted.
 * @param {string} userEmail - The student's email address.
 * @param {string} userName - The student's name.
 * @param {string} bookTitle - The title of the book accepted.
 */
const sendRequestAcceptedEmail = async (userEmail, userName, bookTitle) => {
    try {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"VEMU Digital Library" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Book Request Accepted - VEMU Library',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #22c55e;">Book Request Accepted!</h1>
                    </div>
                    <p>Dear <strong>${userName}</strong>,</p>
                    <p>Good news! Your request for the book <strong>"${bookTitle}"</strong> has been accepted by the librarian.</p>
                    <p>The book has been issued to your account. Please visit the library desk to collect your physical copy if you haven't already.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #22c55e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Your Borrowed Books</a>
                    </div>
                    <p>Remember to return the book by the due date to avoid fines.</p>
                    <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888888; text-align: center;">
                        VEMU Institute of Technology<br>
                        P. Kothakota, Chittoor, Andhra Pradesh, India
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Acceptance email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending acceptance email:', error);
        return false;
    }
};

module.exports = { sendWelcomeEmail, sendRequestAcceptedEmail };
