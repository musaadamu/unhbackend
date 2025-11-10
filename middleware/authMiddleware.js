const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
        console.log('❌ No token provided');
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route - No token provided'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            console.log('❌ User not found for token:', decoded.id);
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!req.user.isActive) {
            console.log('❌ User account is deactivated:', req.user.email);
            return res.status(401).json({
                success: false,
                message: 'User account is deactivated'
            });
        }

        console.log('✅ User authenticated:', req.user.email, 'Role:', req.user.role);
        next();
    } catch (error) {
        console.log('❌ Token verification failed:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route',
            error: error.message
        });
    }
};

// Authorize specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            console.log('❌ No user in request for authorization check');
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route - User not authenticated'
            });
        }

        if (!roles.includes(req.user.role)) {
            console.log(`❌ User ${req.user.email} with role '${req.user.role}' tried to access route requiring roles:`, roles);
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route. Required roles: ${roles.join(', ')}`
            });
        }

        console.log(`✅ User ${req.user.email} authorized with role '${req.user.role}'`);
        next();
    };
};

