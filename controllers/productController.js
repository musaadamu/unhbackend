const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            sort,
            page = 1,
            limit = 12,
            featured,
            inStock
        } = req.query;

        // Build query
        let query = { isActive: true };

        // Filter by category (support both ID and name)
        if (category) {
            // Check if it's a valid ObjectId
            const mongoose = require('mongoose');
            if (mongoose.Types.ObjectId.isValid(category)) {
                query.category = category;
            } else {
                // Look up category by name
                const categoryDoc = await Category.findOne({ name: category });
                if (categoryDoc) {
                    query.category = categoryDoc._id;
                }
            }
        }

        // Search by name, description, or tags
        if (search) {
            query.$text = { $search: search };
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Filter featured products
        if (featured === 'true') {
            query.isFeatured = true;
        }

        // Filter in-stock products
        if (inStock === 'true') {
            query.stock = { $gt: 0 };
        }

        // Sort options
        let sortOption = {};
        if (sort === 'price-asc') sortOption.price = 1;
        else if (sort === 'price-desc') sortOption.price = -1;
        else if (sort === 'name-asc') sortOption.name = 1;
        else if (sort === 'name-desc') sortOption.name = -1;
        else if (sort === 'newest') sortOption.createdAt = -1;
        else if (sort === 'popular') sortOption.sales = -1;
        else sortOption.createdAt = -1; // Default

        // Pagination
        const skip = (page - 1) * limit;

        // Execute query
        const products = await Product.find(query)
            .populate('category', 'name slug')
            .sort(sortOption)
            .limit(Number(limit))
            .skip(skip);

        // Get total count
        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name slug description');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Increment views
        product.views += 1;
        await product.save();

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    try {
        // Normalize images if provided as strings
        if (req.body.images && Array.isArray(req.body.images)) {
            req.body.images = req.body.images.map(img =>
                typeof img === 'string' ? { url: img, alt: req.body.name || '', isPrimary: false } : img
            );
        }

        // Normalize specifications: accept object {key: value} or array
        if (req.body.specifications && !Array.isArray(req.body.specifications)) {
            // If it's an object, convert to array of {name, value}
            if (typeof req.body.specifications === 'object') {
                req.body.specifications = Object.entries(req.body.specifications).map(([name, value]) => ({ name, value }));
            } else {
                // Otherwise, ensure it's an empty array
                req.body.specifications = [];
            }
        }

        // Remove empty SKU to avoid duplicate-key issues
        if ('sku' in req.body && (req.body.sku === '' || req.body.sku == null)) {
            delete req.body.sku;
        }

        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        // Handle duplicate key (unique index) errors more clearly
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {}).join(', ');
            return res.status(400).json({
                success: false,
                message: `Duplicate value for unique field(s): ${field}`,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    try {
        console.log('📝 Updating product:', req.params.id);
        console.log('📝 Update data:', JSON.stringify(req.body, null, 2));
        console.log('📝 User:', req.user?.email, 'Role:', req.user?.role);

        // Defensive normalization: some older records (or clients) may store
        // product.images as an array of strings (filenames). Ensure the
        // payload uses objects with a `url` field to satisfy the schema's
        // validators when using `runValidators: true` on update.
        if (req.body.images && Array.isArray(req.body.images)) {
            req.body.images = req.body.images.map(img =>
                typeof img === 'string' ? { url: img, alt: req.body.name || '', isPrimary: false } : img
            );
        }

        // Normalize specifications (accept object or array)
        if (req.body.specifications && !Array.isArray(req.body.specifications)) {
            if (typeof req.body.specifications === 'object') {
                req.body.specifications = Object.entries(req.body.specifications).map(([name, value]) => ({ name, value }));
            } else {
                req.body.specifications = [];
            }
        }

        // If `sku` is present but an empty string (""), remove it from the
        // update payload. An empty string counts as a value for a unique
        // index and can cause duplicate-key errors if multiple docs have
        // empty sku. Removing it lets the sparse index ignore the field.
        if ('sku' in req.body && (req.body.sku === '' || req.body.sku == null)) {
            delete req.body.sku;
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            console.log('❌ Product not found:', req.params.id);
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        console.log('✅ Product updated successfully:', product.name);
        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        console.error('❌ Error updating product:', error);
        // Handle duplicate key errors explicitly
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {}).join(', ');
            return res.status(400).json({
                success: false,
                message: `Duplicate value for unique field(s): ${field}`,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isFeatured: true, isActive: true })
            .populate('category', 'name slug')
            .limit(8)
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching featured products',
            error: error.message
        });
    }
};

// @desc    Add product review
// @route   POST /api/products/:id/review
// @access  Private
exports.addProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Please provide rating and comment'
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user already reviewed
        const alreadyReviewed = product.reviews.find(
            review => review.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment
        };

        product.reviews.push(review);

        // Update rating
        product.rating.count = product.reviews.length;
        product.rating.average = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

