const express = require('express');
const router = express.Router();
const {
    createServiceRequest,
    getAllServiceRequests,
    getMyServiceRequests,
    getServiceRequest,
    updateServiceRequest,
    deleteServiceRequest,
    getServiceStats
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/request', createServiceRequest);

// Protected routes
router.get('/my-requests', protect, getMyServiceRequests);
router.get('/:id', protect, getServiceRequest);

// Admin routes
router.get('/', protect, authorize('admin'), getAllServiceRequests);
router.get('/admin/stats', protect, authorize('admin'), getServiceStats);
router.put('/:id', protect, authorize('admin'), updateServiceRequest);
router.delete('/:id', protect, authorize('admin'), deleteServiceRequest);

module.exports = router;

