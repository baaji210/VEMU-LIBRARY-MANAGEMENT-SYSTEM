const DbState = require('../models/DbState');
const User = require('../models/User');

// @desc    Get all books
// @route   GET /api/library/books
// @access  Public
exports.getBooks = async (req, res) => {
    try {
        const state = await DbState.findOne().sort({ lastUpdated: -1 });
        res.json(state ? (state.books || []) : []);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch books' });
    }
};

// @desc    Get library stats
// @route   GET /api/library/stats
// @access  Public/Private (depending on requirements)
exports.getStats = async (req, res) => {
    try {
        const state = await DbState.findOne().sort({ lastUpdated: -1 });
        const users = await User.find();
        const books = state ? (state.books || []) : [];
        const txns = state ? (state.txns || []) : [];
        
        res.json({
            totalBooks: books.length,
            totalUsers: users.length,
            issued: txns.filter(t => t.status === 'issued').length,
            overdue: txns.filter(t => t.status === 'overdue').length
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
};

// @desc    Update DB state (Sync)
// @route   POST /api/library/db
// @access  Private (Admin/Librarian)
exports.updateDb = async (req, res) => {
    try {
        const { books, txns, recommendations, requests, payments } = req.body;
        await DbState.findOneAndUpdate({}, {
            books, txns, recommendations, requests, payments,
            lastUpdated: new Date()
        }, { upsert: true, new: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save DB state' });
    }
};

const { sendRequestAcceptedEmail } = require('../utils/emailService');

// @desc    Notify student that their book request was accepted
// @route   POST /api/library/notify-acceptance
// @access  Private (Admin/Librarian)
exports.notifyAcceptance = async (req, res) => {
    try {
        const { email, name, bookTitle } = req.body;
        console.log('Acceptance notification request received for:', email);
        
        if (!email || !name || !bookTitle) {
            console.warn('Missing fields in notification request:', req.body);
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const success = await sendRequestAcceptedEmail(email, name, bookTitle);
        if (success) {
            console.log('Acceptance email successfully sent to:', email);
            res.json({ success: true, message: 'Notification sent' });
        } else {
            console.error('Failed to send acceptance email to:', email);
            res.status(500).json({ message: 'Failed to send notification (SMTP error)' });
        }
    } catch (error) {
        console.error('Notification error:', error);
        res.status(500).json({ message: 'Failed to send notification' });
    }
};

// @desc    Get full DB state
// @route   GET /api/library/db
// @access  Private (Admin/Librarian)
exports.getDbState = async (req, res) => {
    try {
        let state = await DbState.findOne().sort({ lastUpdated: -1 });
        const users = await User.find();
        if (!state) {
            return res.json({ books: [], txns: [], recommendations: [], requests: [], payments: [], users });
        }
        res.json({ ...state.toObject(), users: users.map(u => u.toObject()) });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch DB state' });
    }
};
