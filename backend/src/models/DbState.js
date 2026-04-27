const mongoose = require('mongoose');

const dbStateSchema = new mongoose.Schema({
    books: { type: Array, default: [] },
    txns: { type: Array, default: [] },
    recommendations: { type: Array, default: [] },
    requests: { type: Array, default: [] },
    payments: { type: Array, default: [] },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DbState', dbStateSchema);
