const ServiceRequest = require('../models/ServiceRequest');

// @desc    Create new service request
// @route   POST /api/services/request
// @access  Public
exports.createServiceRequest = async (req, res) => {
    try {
        const { customer, serviceType, category, description, preferredDate } = req.body;

        // Validate required fields
        if (!customer || !customer.name || !customer.email || !customer.phone || !customer.address) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all customer information'
            });
        }

        if (!serviceType || !category || !description) {
            return res.status(400).json({
                success: false,
                message: 'Please provide service type, category, and description'
            });
        }

        const serviceRequest = await ServiceRequest.create({
            customer,
            user: req.user ? req.user._id : null,
            serviceType,
            category,
            description,
            preferredDate
        });

        res.status(201).json({
            success: true,
            data: serviceRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all service requests (admin only)
// @route   GET /api/services
// @access  Private/Admin
exports.getAllServiceRequests = async (req, res) => {
    try {
        const { status, serviceType, category, page = 1, limit = 10 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (serviceType) query.serviceType = serviceType;
        if (category) query.category = category;

        const skip = (page - 1) * limit;

        const serviceRequests = await ServiceRequest.find(query)
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await ServiceRequest.countDocuments(query);

        res.status(200).json({
            success: true,
            count: serviceRequests.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: serviceRequests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user's service requests
// @route   GET /api/services/my-requests
// @access  Private
exports.getMyServiceRequests = async (req, res) => {
    try {
        const serviceRequests = await ServiceRequest.find({
            $or: [
                { user: req.user._id },
                { 'customer.email': req.user.email }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: serviceRequests.length,
            data: serviceRequests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single service request
// @route   GET /api/services/:id
// @access  Private
exports.getServiceRequest = async (req, res) => {
    try {
        const serviceRequest = await ServiceRequest.findById(req.params.id)
            .populate('user', 'name email phone');

        if (!serviceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
        }

        // Check if user is authorized to view this request
        if (req.user.role !== 'admin' && 
            serviceRequest.user?.toString() !== req.user._id.toString() &&
            serviceRequest.customer.email !== req.user.email) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this service request'
            });
        }

        res.status(200).json({
            success: true,
            data: serviceRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update service request
// @route   PUT /api/services/:id
// @access  Private/Admin
exports.updateServiceRequest = async (req, res) => {
    try {
        const { status, assignedTo, estimatedCost, actualCost, adminNotes } = req.body;

        const serviceRequest = await ServiceRequest.findById(req.params.id);

        if (!serviceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
        }

        // Update fields
        if (status) serviceRequest.status = status;
        if (assignedTo) serviceRequest.assignedTo = assignedTo;
        if (estimatedCost !== undefined) serviceRequest.estimatedCost = estimatedCost;
        if (actualCost !== undefined) serviceRequest.actualCost = actualCost;
        if (adminNotes) serviceRequest.adminNotes = adminNotes;

        // Set completed date if status is completed
        if (status === 'completed' && !serviceRequest.completedDate) {
            serviceRequest.completedDate = Date.now();
        }

        await serviceRequest.save();

        res.status(200).json({
            success: true,
            data: serviceRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete service request
// @route   DELETE /api/services/:id
// @access  Private/Admin
exports.deleteServiceRequest = async (req, res) => {
    try {
        const serviceRequest = await ServiceRequest.findById(req.params.id);

        if (!serviceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
        }

        await serviceRequest.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Service request deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get service request statistics (admin only)
// @route   GET /api/services/stats
// @access  Private/Admin
exports.getServiceStats = async (req, res) => {
    try {
        const totalRequests = await ServiceRequest.countDocuments();
        const pendingRequests = await ServiceRequest.countDocuments({ status: 'pending' });
        const completedRequests = await ServiceRequest.countDocuments({ status: 'completed' });
        const inProgressRequests = await ServiceRequest.countDocuments({ status: 'in-progress' });

        const requestsByType = await ServiceRequest.aggregate([
            {
                $group: {
                    _id: '$serviceType',
                    count: { $sum: 1 }
                }
            }
        ]);

        const requestsByCategory = await ServiceRequest.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                total: totalRequests,
                pending: pendingRequests,
                completed: completedRequests,
                inProgress: inProgressRequests,
                byType: requestsByType,
                byCategory: requestsByCategory
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

