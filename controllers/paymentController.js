const axios = require('axios');
const crypto = require('crypto');
const Order = require('../models/Order');

// Initialize Paystack Payment
exports.initializePayment = async (req, res) => {
  try {
    const { email, amount, orderId, metadata } = req.body;

    // Check if Paystack is configured
    if (!process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY === 'your-paystack-secret-key-here') {
      return res.status(500).json({
        success: false,
        message: 'Paystack payment gateway is not configured. Please contact support.'
      });
    }

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

// ==================== REMITA PAYMENT FUNCTIONS ====================

// Initialize Remita Payment
exports.initializeRemitaPayment = async (req, res) => {
  try {
    const { email, amount, orderId, customerName, customerPhone } = req.body;

    const merchantId = process.env.REMITA_MERCHANT_ID;
    const apiKey = process.env.REMITA_API_KEY;
    const serviceTypeId = process.env.REMITA_SERVICE_TYPE_ID;

    // Check if Remita is configured
    if (!merchantId || !apiKey || !serviceTypeId ||
        merchantId === 'your-remita-merchant-id-here' ||
        apiKey === 'your-remita-api-key-here' ||
        serviceTypeId === 'your-remita-service-type-id-here') {
      return res.status(500).json({
        success: false,
        message: 'Remita payment gateway is not configured. Please contact support.'
      });
    }

    // Validate required fields
    if (!email || !amount || !customerName) {
      return res.status(400).json({
        success: false,
        message: 'Email, amount, and customer name are required'
      });
    }

    // Generate unique RRR (Remita Retrieval Reference)
    const rrr = `RMT${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Prepare Remita request
    const remitaData = {
      serviceTypeId: serviceTypeId,
      amount: amount,
      orderId: orderId || `ORD-${Date.now()}`,
      payerName: customerName,
      payerEmail: email,
      payerPhone: customerPhone || '',
      description: `Payment for Order ${orderId}`,
      customFields: [
        {
          name: 'orderId',
          value: orderId
        }
      ]
    };

    // Generate hash for Remita
    const hashString = `${merchantId}${serviceTypeId}${rrr}${amount}${apiKey}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    // Remita API endpoint (use demo for testing, live for production)
    const remitaBaseUrl = process.env.NODE_ENV === 'production'
      ? 'https://login.remita.net'
      : 'https://remitademo.net';

    const response = await axios.post(
      `${remitaBaseUrl}/remita/exapp/api/v1/send/api/echannelsvc/merchant/api/paymentinit`,
      {
        ...remitaData,
        merchantId,
        hash
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `remitaConsumerKey=${merchantId},remitaConsumerToken=${hash}`
        }
      }
    );

    if (response.data.statuscode === '025') {
      // Success - RRR generated
      const paymentUrl = `${remitaBaseUrl}/remita/ecomm/${merchantId}/${response.data.RRR}/${hash}/linkinvoice.reg`;

      res.status(200).json({
        success: true,
        message: 'Remita payment initialized successfully',
        data: {
          rrr: response.data.RRR,
          payment_url: paymentUrl,
          orderId: orderId
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to initialize Remita payment',
        error: response.data.statusMessage || 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Remita payment initialization error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error initializing Remita payment',
      error: error.response?.data?.message || error.message
    });
  }
};

// Verify Remita Payment
exports.verifyRemitaPayment = async (req, res) => {
  try {
    const { rrr } = req.params;

    if (!rrr) {
      return res.status(400).json({
        success: false,
        message: 'RRR (Remita Retrieval Reference) is required'
      });
    }

    const merchantId = process.env.REMITA_MERCHANT_ID;
    const apiKey = process.env.REMITA_API_KEY;

    // Generate hash for verification
    const hashString = `${rrr}${apiKey}${merchantId}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    // Remita API endpoint
    const remitaBaseUrl = process.env.NODE_ENV === 'production'
      ? 'https://login.remita.net'
      : 'https://remitademo.net';

    const response = await axios.get(
      `${remitaBaseUrl}/remita/exapp/api/v1/send/api/echannelsvc/${merchantId}/${rrr}/${hash}/status.reg`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `remitaConsumerKey=${merchantId},remitaConsumerToken=${hash}`
        }
      }
    );

    if (response.data.status === '00' || response.data.status === '01') {
      // Payment successful
      const paymentData = response.data;

      // Update order if orderId is available
      if (paymentData.orderId) {
        const order = await Order.findById(paymentData.orderId);

        if (order) {
          order.paymentStatus = 'paid';
          order.paymentDetails = {
            method: 'remita',
            reference: rrr,
            paidAt: new Date(),
            amount: paymentData.amount,
            channel: 'remita',
            transactionId: paymentData.transactiontime
          };
          await order.save();
        }
      }

      res.status(200).json({
        success: true,
        message: 'Remita payment verified successfully',
        data: {
          rrr: rrr,
          amount: paymentData.amount,
          status: paymentData.message,
          transactionTime: paymentData.transactiontime
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: response.data
      });
    }
  } catch (error) {
    console.error('Remita payment verification error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error verifying Remita payment',
      error: error.response?.data?.message || error.message
    });
  }
};

// Remita Webhook Handler
exports.remitaWebhook = async (req, res) => {
  try {
    const { rrr, orderId, amount, status } = req.body;

    console.log('Remita webhook received:', req.body);

    if (status === '00' || status === '01') {
      // Payment successful
      if (orderId) {
        const order = await Order.findById(orderId);

        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.paymentDetails = {
            method: 'remita',
            reference: rrr,
            paidAt: new Date(),
            amount: amount,
            channel: 'remita'
          };
          await order.save();

          console.log(`Order ${order.orderNumber} payment confirmed via Remita webhook`);
        }
      }
    }

    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Remita webhook error:', error);
    res.status(500).send('Webhook error');
  }
};

