const dotenv = require('dotenv');
// Load environment variables first
dotenv.config();

// Core dependencies
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');

// Middleware imports
const { protect } = require('./middleware/authMiddleware');

// Security middleware imports
const {
    helmetConfig,
    mongoSanitize,
    hpp,
    sanitizeInput,
    securityLogger
} = require('./middleware/security');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const userRoutes = require('./routes/userRoutes');

// Validate required environment variables
const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'PORT'
];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    console.error('Please check your .env file and ensure all required variables are set');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Environment check
const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'deployment';
console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);

// Security middleware setup (MUST be first)
app.use(helmetConfig);
app.use(securityLogger);
app.use(mongoSanitize());
app.use(hpp());
app.use(sanitizeInput);

// Basic middleware setup
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined'));

// CORS Configuration for development and production
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',  // Vite default port
    'https://unhfrontend.vercel.app',  // Production frontend (Vercel)
    process.env.FRONTEND_URL
].filter(Boolean);

console.log('🌐 Allowed CORS origins:', allowedOrigins);

// Global CORS middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (!origin) {
        res.header('Access-Control-Allow-Origin', '*');
    } else if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,HEAD,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Expose-Headers', 'Authorization, Content-Disposition, Content-Type, Content-Length');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is running',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);

// Serve static files from frontend images directory
const imagesPath = path.resolve(path.join(__dirname, '..', 'frontend', 'public', 'images'));
console.log('Static images path:', imagesPath);
app.use('/images', express.static(imagesPath));

// Improved MongoDB Connection
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            retryReads: true,
            maxPoolSize: 10,
        });

        console.log('✅ MongoDB connected successfully');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        setTimeout(() => connectDB(), 5000);
    }
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed due to app termination');
        process.exit(0);
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        process.exit(1);
    }
});

// Enhanced error handling
app.use((err, req, res, next) => {
    console.error(err.stack);

    if (req.accepts('json')) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
        });
    } else {
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
const startServer = async () => {
    try {
        await connectDB();
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.log('⚠️  Starting server without MongoDB for testing...');
    }

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`Backend URL: http://localhost:${PORT}`);
        console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
        console.log('📡 Server is ready to accept requests');
        console.log('');
        console.log('📋 Available endpoints:');
        console.log('   - GET  /api/products');
        console.log('   - POST /api/products (admin)');
        console.log('   - GET  /api/categories');
        console.log('   - GET  /api/orders');
        console.log('');
    });
};

startServer();

