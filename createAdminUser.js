const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// User Model Schema (inline to avoid import issues)
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

// Admin user details
const adminUser = {
    name: 'Musa Adamu',
    email: 'msmajemusa4@gmail.com',
    password: 'unh@@@2025',
    role: 'admin',
    isEmailVerified: true
};

// Connect to MongoDB and create admin user
const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        
        if (!mongoUri) {
            console.error('❌ Error: MONGODB_URI or MONGO_URI not found in .env file');
            process.exit(1);
        }

        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB connected successfully');

        // Check if admin user already exists
        const existingUser = await User.findOne({ email: adminUser.email });
        
        if (existingUser) {
            console.log('⚠️  Admin user already exists with email:', adminUser.email);
            console.log('📧 Email:', existingUser.email);
            console.log('👤 Name:', existingUser.name);
            console.log('🔑 Role:', existingUser.role);
            
            // Update password if needed
            const updatePassword = process.argv.includes('--update-password');
            if (updatePassword) {
                console.log('🔄 Updating password...');
                const salt = await bcrypt.genSalt(10);
                existingUser.password = await bcrypt.hash(adminUser.password, salt);
                await existingUser.save();
                console.log('✅ Password updated successfully!');
            } else {
                console.log('\n💡 Tip: Use --update-password flag to update the password');
            }
        } else {
            // Hash password
            console.log('🔄 Creating new admin user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminUser.password, salt);

            // Create admin user
            const newAdmin = await User.create({
                ...adminUser,
                password: hashedPassword
            });

            console.log('✅ Admin user created successfully!');
            console.log('📧 Email:', newAdmin.email);
            console.log('👤 Name:', newAdmin.name);
            console.log('🔑 Role:', newAdmin.role);
            console.log('🔐 Password:', adminUser.password);
        }

        console.log('\n🎉 Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

// Run the script
createAdminUser();

