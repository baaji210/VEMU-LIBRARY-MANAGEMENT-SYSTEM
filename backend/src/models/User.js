const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    role: { type: String, required: true, enum: ['student', 'faculty', 'librarian', 'admin'] },
    roll: String,
    empId: String,
    deg: String,
    dept: String,
    year: String,
    sec: String,
    pass: { type: String, required: true },
    joinDate: { type: String, default: () => new Date().toLocaleDateString('en-GB') },
    active: { type: Boolean, default: true }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('pass')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.pass = await bcrypt.hash(this.pass, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    const isMatch = await bcrypt.compare(enteredPassword, this.pass);
    if (isMatch) return true;
    
    // Fallback for legacy plain-text passwords
    if (enteredPassword === this.pass) {
        // Automatically hash the plain-text password for future logins
        this.pass = enteredPassword;
        await this.save();
        return true;
    }
    return false;
};

module.exports = mongoose.model('User', userSchema);
