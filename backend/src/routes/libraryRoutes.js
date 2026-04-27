const express = require('express');
const router = express.Router();
const { getBooks, getStats, updateDb, getDbState, notifyAcceptance } = require('../controllers/libraryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/books', getBooks);
router.get('/stats', getStats);

// Admin/Librarian only routes
router.route('/db')
    .get(getDbState)
    .post(updateDb);

router.post('/notify-acceptance', notifyAcceptance);

module.exports = router;
