const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function listProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const products = await Product.find({}).select('name images').limit(20);
    
    console.log(`Found ${products.length} products:\n`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Images: ${JSON.stringify(product.images)}\n`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listProducts();

