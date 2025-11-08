const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
    customer: {
        name: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Customer email is required'],
            lowercase: true,
            trim: true
        },
        phone: {
            type: String,
            required: [true, 'Customer phone is required'],
            trim: true
        },
        address: {
            type: String,
            required: [true, 'Customer address is required']
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    serviceType: {
        type: String,
        required: [true, 'Service type is required'],
        enum: ['installation', 'repair', 'maintenance', 'consultation'],
        lowercase: true
    },
    category: {
        type: String,
        required: [true, 'Service category is required'],
        enum: ['electrical', 'solar', 'appliance'],
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Service description is required']
    },
    preferredDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
        default: 'pending',
        lowercase: true
    },
    assignedTo: {
        type: String,
        trim: true
    },
    estimatedCost: {
        type: Number,
        min: 0
    },
    actualCost: {
        type: Number,
        min: 0
    },
    notes: {
        type: String
    },
    adminNotes: {
        type: String
    },
    completedDate: {
        type: Date
    },
    requestNumber: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

// Generate request number before saving
serviceRequestSchema.pre('save', async function(next) {
    if (!this.requestNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        
        // Count documents created this month
        const count = await this.constructor.countDocuments({
            createdAt: {
                $gte: new Date(date.getFullYear(), date.getMonth(), 1),
                $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
            }
        });
        
        const sequence = (count + 1).toString().padStart(4, '0');
        this.requestNumber = `SRV${year}${month}${sequence}`;
    }
    next();
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);

