const ContactMessage = require('../models/ContactMessage');

// @desc    Submit contact message
// @route   POST /api/contact
// @access  Public
exports.submitMessage = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        const contactMessage = await ContactMessage.create({
            name,
            email,
            phone,
            subject,
            message
        });

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon.',
            contactMessage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message
        });
    }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
exports.getMessages = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        let query = {};
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const messages = await ContactMessage.find(query)
            .sort('-createdAt')
            .limit(Number(limit))
            .skip(skip);

        const total = await ContactMessage.countDocuments(query);

        res.status(200).json({
            success: true,
            count: messages.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching messages',
            error: error.message
        });
    }
};

// @desc    Get single contact message
// @route   GET /api/contact/:id
// @access  Private/Admin
exports.getMessage = async (req, res) => {
    try {
        const message = await ContactMessage.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Mark as read
        if (message.status === 'unread') {
            message.status = 'read';
            await message.save();
        }

        res.status(200).json({
            success: true,
            message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching message',
            error: error.message
        });
    }
};

// @desc    Reply to contact message
// @route   PUT /api/contact/:id/reply
// @access  Private/Admin
exports.replyMessage = async (req, res) => {
    try {
        const { reply, status } = req.body;

        const message = await ContactMessage.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // If reply text is provided, save it
        if (reply && reply.trim()) {
            message.reply = {
                message: reply,
                date: Date.now(),
                repliedBy: req.user.id
            };
            message.status = 'replied';
            message.repliedAt = Date.now();
        } else if (status) {
            // Just update status (e.g., mark as read)
            message.status = status === 'read' ? 'read' : message.status;
        }

        await message.save();

        res.status(200).json({
            success: true,
            message: reply ? 'Reply sent successfully' : 'Status updated successfully',
            message: message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sending reply',
            error: error.message
        });
    }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteMessage = async (req, res) => {
    try {
        const message = await ContactMessage.findByIdAndDelete(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting message',
            error: error.message
        });
    }
};

