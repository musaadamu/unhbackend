const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    getUserStats
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are admin only
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/stats/overview', protect, authorize('admin'), getUserStats);
router.get('/:id', protect, authorize('admin'), getUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;

