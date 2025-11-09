const axios = require('axios');
const Order = require('../models/Order');

// Initialize Paystack Payment
exports.initializePayment = async (req, res) => {
  try {
    const { email, amount, orderId, metadata } = req.body;

    // Validate required fields
    if (!email || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Email and amount are required'
      });
    }

    // Convert amount to kobo (Paystack uses kobo, not naira)
    const amountInKobo = Math.round(amount * 100);

    // Prepare Paystack request
    const paystackData = {
      email,
      amount: amountInKobo,
      currency: 'NGN',
      reference: orderId || `ORD-${Date.now()}`,
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/verify`,
      metadata: {
        orderId,
        custom_fields: [
          {
            display_name: 'Order ID',
            variable_name: 'order_id',
            value: orderId
          },
          ...(metadata?.custom_fields || [])
        ]
      }
    };

    // Initialize payment with Paystack
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      paystackData,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status) {
      res.status(200).json({
        success: true,
        message: 'Payment initialized successfully',
        data: {
          authorization_url: response.data.data.authorization_url,
          access_code: response.data.data.access_code,
          reference: response.data.data.reference
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to initialize payment',
        error: response.data.message
      });
    }
  } catch (error) {
    console.error('Payment initialization error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error initializing payment',
      error: error.response?.data?.message || error.message
    });
  }
};

// Verify Paystack Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required'
      });
    }

    // Verify payment with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (response.data.status && response.data.data.status === 'success') {
      const paymentData = response.data.data;

      // Update order payment status if orderId is in metadata
      if (paymentData.metadata && paymentData.metadata.orderId) {
        const order = await Order.findById(paymentData.metadata.orderId);
        
        if (order) {
          order.paymentStatus = 'paid';
          order.paymentDetails = {
            method: 'paystack',
            reference: paymentData.reference,
            paidAt: new Date(paymentData.paid_at),
            amount: paymentData.amount / 100, // Convert from kobo to naira
            channel: paymentData.channel,
            transactionId: paymentData.id
          };
          await order.save();
        }
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          reference: paymentData.reference,
          amount: paymentData.amount / 100,
          currency: paymentData.currency,
          status: paymentData.status,
          paidAt: paymentData.paid_at,
          channel: paymentData.channel
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: response.data.data
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.response?.data?.message || error.message
    });
  }
};

// Paystack Webhook Handler
exports.paystackWebhook = async (req, res) => {
  try {
    const hash = require('crypto')
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash === req.headers['x-paystack-signature']) {
      const event = req.body;

      // Handle different event types
      switch (event.event) {
        case 'charge.success':
          // Payment was successful
          const paymentData = event.data;
          
          if (paymentData.metadata && paymentData.metadata.orderId) {
            const order = await Order.findById(paymentData.metadata.orderId);
            
            if (order && order.paymentStatus !== 'paid') {
              order.paymentStatus = 'paid';
              order.paymentDetails = {
                method: 'paystack',
                reference: paymentData.reference,
                paidAt: new Date(paymentData.paid_at),
                amount: paymentData.amount / 100,
                channel: paymentData.channel,
                transactionId: paymentData.id
              };
              await order.save();
              
              console.log(`Order ${order.orderNumber} payment confirmed via webhook`);
            }
          }
          break;

        case 'charge.failed':
          // Payment failed
          console.log('Payment failed:', event.data.reference);
          break;

        default:
          console.log('Unhandled webhook event:', event.event);
      }

      res.status(200).send('Webhook received');
    } else {
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook error');
  }
};

// Get Payment Status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        paymentDetails: order.paymentDetails
      }
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment status',
      error: error.message
    });
  }
};

