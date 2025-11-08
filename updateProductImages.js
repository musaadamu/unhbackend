const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Mapping of product names/categories to actual image files
// Images are stored as objects with url, alt, and isPrimary fields
const imageMapping = {
  // Switches
  'Wall Switch - Single Gang': [{ url: 'switch1.jfif', alt: 'Single Gang Switch', isPrimary: true }],
  'Wall Switch - Double Gang': [{ url: 'switch2.jfif', alt: 'Double Gang Switch', isPrimary: true }],
  'Wall Switch - Triple Gang': [{ url: 'switch3.jfif', alt: 'Triple Gang Switch', isPrimary: true }],
  'Dimmer Switch': [{ url: 'switch4.jfif', alt: 'Dimmer Switch', isPrimary: true }],

  // Sockets
  'Power Socket - 13A': [{ url: 'socket1.jfif', alt: '13A Power Socket', isPrimary: true }],
  '3-Pin Plug - 13A': [{ url: 'socket2.jfif', alt: '3-Pin Plug', isPrimary: true }],
  'USB Socket': [{ url: 'socket3.jfif', alt: 'USB Socket', isPrimary: true }],
  'Extension Socket': [{ url: 'socket4.jfif', alt: 'Extension Socket', isPrimary: true }],
  'Waterproof Socket': [{ url: 'socket5.jfif', alt: 'Waterproof Socket', isPrimary: true }],
  'Multi-Socket Extension': [{ url: 'socket6.jfif', alt: 'Multi-Socket Extension', isPrimary: true }],

  // Cables & Wires
  'Electrical Cable - 2.5mm': [{ url: 'electricalequipment.JPG', alt: 'Electrical Cable', isPrimary: true }],
  'Electrical Cable - 4mm': [{ url: 'electricalequipment.JPG', alt: 'Electrical Cable', isPrimary: true }],

  // Lamps
  'Modern Wall Bracket Light': [{ url: 'Ligtening.JPG', alt: 'Wall Bracket Light', isPrimary: true }],
  'Fashion Table Lamp': [{ url: 'lightenning2.JPG', alt: 'Table Lamp', isPrimary: true }],
  'Ceiling Lamp - Modern Design': [{ url: 'ledpanel.jfif', alt: 'Ceiling Lamp', isPrimary: true }],
  'Rechargeable Emergency Lamp': [{ url: 'ledpanel.jfif', alt: 'Emergency Lamp', isPrimary: true }],

  // Bulbs
  'LED Bulb - 9W': [{ url: 'globe1.jfif', alt: 'LED Bulb 9W', isPrimary: true }],
  'LED Bulb - 15W': [{ url: 'globes.JPG', alt: 'LED Bulb 15W', isPrimary: true }],
  'Rechargeable LED Bulb': [{ url: 'globe1.jfif', alt: 'Rechargeable LED Bulb', isPrimary: true }],

  // Fans
  'Ceiling Fan - 56 Inch': [{ url: 'ceilingfan1.jfif', alt: 'Ceiling Fan', isPrimary: true }],
  'Standing Fan - 18 Inch': [{ url: 'ceilingfan1.jfif', alt: 'Standing Fan', isPrimary: true }],

  // Kitchen Appliances
  'Refrigerator - Double Door': [{ url: 'fridge1.jfif', alt: 'Double Door Refrigerator', isPrimary: true }],
  'Electric Stove - 4 Burner': [{ url: 'electricoven.JPG', alt: 'Electric Stove', isPrimary: true }],
  'Blender - 1.5L': [{ url: 'blender.JPG', alt: 'Blender', isPrimary: true }],
  'Microwave Oven - 20L': [{ url: 'electricoven.JPG', alt: 'Microwave Oven', isPrimary: true }],
  'Electric Kettle - 1.7L': [{ url: 'boiler1.JPG', alt: 'Electric Kettle', isPrimary: true }],
  'Hot Plate - Single Burner': [{ url: 'hotplate.JPG', alt: 'Hot Plate', isPrimary: true }],

  // Cleaning Appliances
  'Washing Machine - 7kg': [{ url: 'device2.JPG', alt: 'Washing Machine', isPrimary: true }],
  'Vacuum Cleaner': [{ url: 'device2.JPG', alt: 'Vacuum Cleaner', isPrimary: true }],

  // Entertainment
  'LED Television - 43 Inch': [{ url: 'flatscreentv.JPG', alt: 'LED Television', isPrimary: true }],
  'Portable Radio': [{ url: 'device2.JPG', alt: 'Portable Radio', isPrimary: true }],
  'Home Theatre System': [{ url: 'speaker1.JPG', alt: 'Home Theatre System', isPrimary: true }],
  'Bluetooth Speaker': [{ url: 'speaker2.JPG', alt: 'Bluetooth Speaker', isPrimary: true }],

  // Security
  'Smoke Detector': [{ url: 'device2.JPG', alt: 'Smoke Detector', isPrimary: true }],
  'Fire Alarm System': [{ url: 'device2.JPG', alt: 'Fire Alarm System', isPrimary: true }],
  'CCTV Camera - HD': [{ url: 'device2.JPG', alt: 'CCTV Camera', isPrimary: true }],
  'Motion Sensor': [{ url: 'device2.JPG', alt: 'Motion Sensor', isPrimary: true }],
  'Door Alarm System': [{ url: 'device2.JPG', alt: 'Door Alarm System', isPrimary: true }],

  // Power Backup
  'Generator - 2.5KVA': [{ url: 'generator.JPG', alt: 'Generator 2.5KVA', isPrimary: true }],
  'Generator - 5KVA': [{ url: 'generator.JPG', alt: 'Generator 5KVA', isPrimary: true }],
  'Power Inverter - 1000W': [{ url: 'device2.JPG', alt: 'Power Inverter', isPrimary: true }],
  'Solar Panel - 100W': [{ url: 'solar1.jfif', alt: 'Solar Panel 100W', isPrimary: true }],
  'Solar Panel - 200W': [{ url: 'solar2.JPG', alt: 'Solar Panel 200W', isPrimary: true }],
  'Solar Charge Controller': [{ url: 'solar3.JPG', alt: 'Solar Charge Controller', isPrimary: true }],

  // Piping Tools
  'Junction Box - 4x4': [{ url: 'junctionbox.JPG', alt: 'Junction Box', isPrimary: true }],
  'Knockout Box': [{ url: 'nockoutbox.JPG', alt: 'Knockout Box', isPrimary: true }],
  'Male Bush Connector': [{ url: 'connector.JPG', alt: 'Male Bush Connector', isPrimary: true }],
  'Coupling Connector': [{ url: 'connector.JPG', alt: 'Coupling Connector', isPrimary: true }],
  'PVC Conduit Pipe - 20mm': [{ url: 'conductpipes.JPG', alt: 'PVC Conduit Pipe 20mm', isPrimary: true }],
  'PVC Conduit Pipe - 25mm': [{ url: 'conductpipes2.JPG', alt: 'PVC Conduit Pipe 25mm', isPrimary: true }],
  'Distribution Board': [{ url: 'device2.JPG', alt: 'Distribution Board', isPrimary: true }],
  'Drop Box': [{ url: 'nockoutbox2.JPG', alt: 'Drop Box', isPrimary: true }],
  'ELCB Safety Box': [{ url: 'device2.JPG', alt: 'ELCB Safety Box', isPrimary: true }],
  'Fish Tape - 10m': [{ url: 'tool.JPG', alt: 'Fish Tape', isPrimary: true }],
  'Bending Spring - 20mm': [{ url: 'tool.JPG', alt: 'Bending Spring 20mm', isPrimary: true }],
  'Bending Spring - 25mm': [{ url: 'tool.JPG', alt: 'Bending Spring 25mm', isPrimary: true }],
};

async function updateProductImages() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('\nUpdating product images...');
    
    let updatedCount = 0;
    let notFoundCount = 0;

    for (const [productName, images] of Object.entries(imageMapping)) {
      const result = await Product.updateOne(
        { name: productName },
        { $set: { images: images } }
      );

      if (result.matchedCount > 0) {
        console.log(`✓ Updated: ${productName} -> ${images.join(', ')}`);
        updatedCount++;
      } else {
        console.log(`✗ Not found: ${productName}`);
        notFoundCount++;
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Updated: ${updatedCount} products`);
    console.log(`Not found: ${notFoundCount} products`);
    console.log('\nProduct images updated successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating product images:', error);
    process.exit(1);
  }
}

updateProductImages();

