const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const { role, search, page = 1, limit = 20, isActive } = req.query;

        let query = {};

        // Filter by role
        if (role) {
            query.role = role;
        }

        // Filter by active status
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        // Search by name or email
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .select('-password')
            .sort('-createdAt')
            .limit(Number(limit))
            .skip(skip);

        const total = await User.countDocuments(query);

        // Get order counts for each user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const orderCount = await Order.countDocuments({ customer: user._id });
                const totalSpent = await Order.aggregate([
                    { $match: { customer: user._id, paymentStatus: 'paid' } },
                    { $group: { _id: null, total: { $sum: '$total' } } }
                ]);

                return {
                    ...user.toObject(),
                    orderCount,
                    totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0
                };
            })
        );

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            users: usersWithStats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's orders
        const orders = await Order.find({ customer: user._id })
            .populate('items.product', 'name images')
            .sort('-createdAt')
            .limit(10);

        // Get user stats
        const orderCount = await Order.countDocuments({ customer: user._id });
        const totalSpent = await Order.aggregate([
            { $match: { customer: user._id, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        res.status(200).json({
            success: true,
            user: {
                ...user.toObject(),
                orderCount,
                totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0,
                recentOrders: orders
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        const { name, email, phone, role, isActive, address } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (role) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;
        if (address) user.address = address;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user has orders
        const orderCount = await Order.countDocuments({ customer: user._id });
        
        if (orderCount > 0) {
            // Instead of deleting, deactivate the user
            user.isActive = false;
            await user.save();

            return res.status(200).json({
                success: true,
                message: 'User has existing orders. Account has been deactivated instead of deleted.',
                user: {
                    id: user._id,
                    isActive: user.isActive
                }
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};

// @desc    Get user statistics
// @route   GET /api/users/stats/overview
// @access  Private/Admin
exports.getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const customers = await User.countDocuments({ role: 'customer' });
        const admins = await User.countDocuments({ role: 'admin' });

        // Users registered in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
                customers,
                admins,
                newUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user statistics',
            error: error.message
        });
    }
};

