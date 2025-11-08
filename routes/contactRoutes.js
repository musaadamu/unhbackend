const express = require('express');
const router = express.Router();
const {
    submitMessage,
    getMessages,
    getMessage,
    replyMessage,
    deleteMessage
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route
router.post('/', submitMessage);

// Admin routes
router.get('/', protect, authorize('admin'), getMessages);
router.get('/:id', protect, authorize('admin'), getMessage);
router.put('/:id/reply', protect, authorize('admin'), replyMessage);
router.delete('/:id', protect, authorize('admin'), deleteMessage);

module.exports = router;

