const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
  // 1. FITTINGS - Switches, Sockets & Plugs
  {
    name: 'Wall Switch - Single Gang',
    description: 'High-quality single gang wall switch for residential and commercial use',
    price: 500,
    category: 'Fittings',
    subcategory: 'Switches',
    stock: 100,
    images: ['switches.jpg'],
    specifications: {
      type: 'Single Gang',
      voltage: '250V',
      current: '10A'
    }
  },
  {
    name: 'Wall Switch - Double Gang',
    description: 'Durable double gang wall switch with modern design',
    price: 800,
    category: 'Fittings',
    subcategory: 'Switches',
    stock: 80,
    images: ['switches.jpg']
  },
  {
    name: 'Power Socket - 13A',
    description: 'Standard 13A power socket with safety shutters',
    price: 600,
    category: 'Fittings',
    subcategory: 'Sockets',
    stock: 120,
    images: ['sockets.jpg']
  },
  {
    name: '3-Pin Plug - 13A',
    description: 'Heavy-duty 3-pin plug for appliances',
    price: 300,
    category: 'Fittings',
    subcategory: 'Plugs',
    stock: 200,
    images: ['plugs.jpg']
  },

  // 2. CABLES & WIRES
  {
    name: 'Electrical Cable - 2.5mm',
    description: 'High-quality copper electrical cable, sold per meter',
    price: 150,
    category: 'Fittings',
    subcategory: 'Cables & Wires',
    stock: 500,
    unit: 'meter',
    images: ['cables.jpg']
  },
  {
    name: 'Electrical Cable - 4mm',
    description: 'Heavy-duty copper electrical cable for high power applications',
    price: 250,
    category: 'Fittings',
    subcategory: 'Cables & Wires',
    stock: 300,
    unit: 'meter',
    images: ['cables.jpg']
  },

  // 3. FASHION LAMPS & WALL BRACKETS
  {
    name: 'Modern Wall Bracket Light',
    description: 'Elegant wall bracket light for indoor decoration',
    price: 3500,
    category: 'Lighting',
    subcategory: 'Wall Lamps',
    stock: 25,
    images: ['wall-bracket.jpg']
  },
  {
    name: 'Fashion Table Lamp',
    description: 'Stylish table lamp with adjustable brightness',
    price: 4500,
    category: 'Lighting',
    subcategory: 'Table Lamps',
    stock: 30,
    images: ['table-lamp.jpg']
  },

  // 4. LIGHTING COMPONENTS - Bulbs
  {
    name: 'LED Bulb - 9W',
    description: 'Energy-saving LED bulb, bright white light',
    price: 800,
    category: 'Lighting',
    subcategory: 'Bulbs',
    stock: 150,
    specifications: {
      wattage: '9W',
      type: 'LED',
      color: 'White'
    },
    images: ['led-bulb.jpg']
  },
  {
    name: 'LED Bulb - 15W',
    description: 'High-brightness LED bulb for large rooms',
    price: 1200,
    category: 'Lighting',
    subcategory: 'Bulbs',
    stock: 100,
    specifications: {
      wattage: '15W',
      type: 'LED'
    },
    images: ['led-bulb.jpg']
  },
  {
    name: 'Rechargeable LED Bulb - 12W',
    description: 'Emergency rechargeable LED bulb with backup battery',
    price: 2500,
    category: 'Lighting',
    subcategory: 'Bulbs',
    stock: 60,
    images: ['rechargeable-bulb.jpg']
  },

  // 5. LAMPS
  {
    name: 'Ceiling Lamp - Modern Design',
    description: 'Contemporary ceiling lamp for living rooms',
    price: 8500,
    category: 'Lighting',
    subcategory: 'Ceiling Lamps',
    stock: 20,
    images: ['ceiling-lamp.jpg']
  },
  {
    name: 'Rechargeable Emergency Lamp',
    description: 'Portable rechargeable lamp with long battery life',
    price: 3500,
    category: 'Lighting',
    subcategory: 'Rechargeable Lamps',
    stock: 40,
    images: ['rechargeable-lamp.jpg']
  },

  // 6. FANS
  {
    name: 'Ceiling Fan - 56 Inch',
    description: 'High-speed ceiling fan with remote control',
    price: 15000,
    category: 'Lighting',
    subcategory: 'Ceiling Fans',
    stock: 15,
    specifications: {
      size: '56 inch',
      speed: '3 Speed',
      features: 'Remote Control'
    },
    images: ['ceiling-fan.jpg']
  },
  {
    name: 'Standing Fan - 18 Inch',
    description: 'Oscillating standing fan with adjustable height',
    price: 12000,
    category: 'Lighting',
    subcategory: 'Standing Fans',
    stock: 25,
    images: ['standing-fan.jpg']
  },

  // 7. KITCHEN APPLIANCES
  {
    name: 'Refrigerator - Double Door',
    description: 'Energy-efficient double door refrigerator, 350L capacity',
    price: 180000,
    category: 'Kitchen Appliances',
    subcategory: 'Refrigerators',
    stock: 5,
    specifications: {
      capacity: '350L',
      type: 'Double Door',
      energyRating: 'A+'
    },
    images: ['refrigerator.jpg'],
    featured: true
  },
  {
    name: 'Electric Stove - 4 Burner',
    description: 'Four-burner electric stove with oven',
    price: 85000,
    category: 'Kitchen Appliances',
    subcategory: 'Stoves',
    stock: 8,
    images: ['electric-stove.jpg']
  },
  {
    name: 'Blender - 1.5L',
    description: 'Powerful blender for smoothies and food processing',
    price: 12000,
    category: 'Kitchen Appliances',
    subcategory: 'Blenders',
    stock: 30,
    images: ['blender.jpg']
  },
  {
    name: 'Microwave Oven - 20L',
    description: 'Digital microwave oven with grill function',
    price: 35000,
    category: 'Kitchen Appliances',
    subcategory: 'Microwaves',
    stock: 12,
    images: ['microwave.jpg']
  },
  {
    name: 'Electric Kettle - 1.8L',
    description: 'Fast-boiling electric kettle with auto shut-off',
    price: 6500,
    category: 'Kitchen Appliances',
    subcategory: 'Kettles',
    stock: 40,
    images: ['electric-kettle.jpg']
  },

  // 8. CLEANING APPLIANCES
  {
    name: 'Washing Machine - 7kg',
    description: 'Automatic washing machine with multiple wash programs',
    price: 120000,
    category: 'Cleaning Appliances',
    subcategory: 'Washing Machines',
    stock: 6,
    specifications: {
      capacity: '7kg',
      type: 'Automatic'
    },
    images: ['washing-machine.jpg'],
    featured: true
  },
  {
    name: 'Vacuum Cleaner',
    description: 'Powerful vacuum cleaner for home and office',
    price: 25000,
    category: 'Cleaning Appliances',
    subcategory: 'Vacuum Cleaners',
    stock: 15,
    images: ['vacuum-cleaner.jpg']
  },

  // 9. ENTERTAINMENT ELECTRONICS
  {
    name: 'LED Television - 43 Inch',
    description: 'Full HD LED TV with smart features',
    price: 150000,
    category: 'Entertainment',
    subcategory: 'Televisions',
    stock: 10,
    specifications: {
      size: '43 inch',
      resolution: 'Full HD',
      smart: 'Yes'
    },
    images: ['television.jpg'],
    featured: true
  },
  {
    name: 'FM Radio - Portable',
    description: 'Portable FM radio with USB and SD card support',
    price: 4500,
    category: 'Entertainment',
    subcategory: 'Radios',
    stock: 35,
    images: ['radio.jpg']
  },
  {
    name: 'Home Theatre System',
    description: '5.1 channel home theatre with powerful bass',
    price: 65000,
    category: 'Entertainment',
    subcategory: 'Home Theatre',
    stock: 8,
    images: ['home-theatre.jpg']
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Wireless Bluetooth speaker with long battery life',
    price: 8500,
    category: 'Entertainment',
    subcategory: 'Speakers',
    stock: 45,
    images: ['speaker.jpg']
  },

  // 10. SAFETY AND SECURITY
  {
    name: 'Smoke Detector',
    description: 'Battery-powered smoke detector with alarm',
    price: 5500,
    category: 'Security',
    subcategory: 'Smoke Detectors',
    stock: 20,
    images: ['smoke-detector.jpg']
  },
  {
    name: 'Fire Alarm System',
    description: 'Complete fire alarm system for homes and offices',
    price: 25000,
    category: 'Security',
    subcategory: 'Fire Alarms',
    stock: 10,
    images: ['fire-alarm.jpg']
  },
  {
    name: 'CCTV Camera - HD',
    description: 'HD CCTV camera with night vision',
    price: 18000,
    category: 'Security',
    subcategory: 'CCTV Cameras',
    stock: 25,
    specifications: {
      resolution: '1080p',
      nightVision: 'Yes'
    },
    images: ['cctv-camera.jpg']
  },
  {
    name: 'Motion Sensor',
    description: 'PIR motion sensor for security systems',
    price: 4500,
    category: 'Security',
    subcategory: 'Motion Sensors',
    stock: 30,
    images: ['motion-sensor.jpg']
  },
  {
    name: 'Door Alarm',
    description: 'Wireless door alarm with remote control',
    price: 3500,
    category: 'Security',
    subcategory: 'Door Alarms',
    stock: 40,
    images: ['door-alarm.jpg']
  },

  // 11. POWER BACKUP SYSTEMS
  {
    name: 'Generator - 2.5KVA',
    description: 'Portable petrol generator for home backup',
    price: 85000,
    category: 'Power Backup',
    subcategory: 'Generators',
    stock: 8,
    specifications: {
      capacity: '2.5KVA',
      fuel: 'Petrol'
    },
    images: ['generator.jpg'],
    featured: true
  },
  {
    name: 'Generator - 5KVA',
    description: 'Heavy-duty generator for commercial use',
    price: 180000,
    category: 'Power Backup',
    subcategory: 'Generators',
    stock: 4,
    specifications: {
      capacity: '5KVA',
      fuel: 'Petrol'
    },
    images: ['generator.jpg']
  },
  {
    name: 'Inverter - 1.5KVA',
    description: 'Pure sine wave inverter with battery charger',
    price: 45000,
    category: 'Power Backup',
    subcategory: 'Inverters',
    stock: 12,
    images: ['inverter.jpg']
  },
  {
    name: 'Solar Panel - 100W',
    description: 'Monocrystalline solar panel for home use',
    price: 35000,
    category: 'Power Backup',
    subcategory: 'Solar Panels',
    stock: 20,
    specifications: {
      wattage: '100W',
      type: 'Monocrystalline'
    },
    images: ['solar-panel.jpg']
  },
  {
    name: 'Solar Panel - 200W',
    description: 'High-efficiency solar panel for larger systems',
    price: 65000,
    category: 'Power Backup',
    subcategory: 'Solar Panels',
    stock: 15,
    images: ['solar-panel.jpg']
  },
  {
    name: 'Charge Controller - 30A',
    description: 'PWM solar charge controller with LCD display',
    price: 12000,
    category: 'Power Backup',
    subcategory: 'Charge Controllers',
    stock: 25,
    images: ['charge-controller.jpg']
  },

  // 12. PIPING TOOLS
  {
    name: 'Circular Junction Box',
    description: 'Circular electrical junction box for conduit connections',
    price: 250,
    category: 'Piping Tools',
    subcategory: 'Junction Boxes',
    stock: 100,
    images: ['junction-box.jpg']
  },
  {
    name: 'Knockout Box',
    description: 'Metal knockout box for electrical installations',
    price: 400,
    category: 'Piping Tools',
    subcategory: 'Junction Boxes',
    stock: 80,
    images: ['knockout-box.jpg']
  },
  {
    name: 'Male Bush Connector',
    description: 'PVC male bush for conduit connections',
    price: 100,
    category: 'Piping Tools',
    subcategory: 'Connectors',
    stock: 200,
    images: ['male-bush.jpg']
  },
  {
    name: 'Coupling Joint',
    description: 'PVC coupling joint for joining conduits',
    price: 120,
    category: 'Piping Tools',
    subcategory: 'Connectors',
    stock: 150,
    images: ['coupling.jpg']
  },
  {
    name: 'PVC Conduit Pipe - 20mm',
    description: 'Heavy-duty PVC conduit pipe, sold per meter',
    price: 200,
    category: 'Piping Tools',
    subcategory: 'Conduit Pipes',
    stock: 300,
    unit: 'meter',
    images: ['conduit-pipe.jpg']
  },
  {
    name: 'PVC Conduit Pipe - 25mm',
    description: 'Large diameter PVC conduit pipe, sold per meter',
    price: 280,
    category: 'Piping Tools',
    subcategory: 'Conduit Pipes',
    stock: 250,
    unit: 'meter',
    images: ['conduit-pipe.jpg']
  },
  {
    name: 'Distribution Board - 8 Way',
    description: 'Metal distribution board with 8 circuit breakers',
    price: 8500,
    category: 'Piping Tools',
    subcategory: 'Distribution Boards',
    stock: 15,
    images: ['distribution-board.jpg']
  },
  {
    name: 'Drop Box',
    description: 'Surface-mounted drop box for switches and sockets',
    price: 350,
    category: 'Piping Tools',
    subcategory: 'Junction Boxes',
    stock: 90,
    images: ['drop-box.jpg']
  },
  {
    name: 'ELCB Box',
    description: 'Earth leakage circuit breaker box for safety',
    price: 4500,
    category: 'Piping Tools',
    subcategory: 'Safety Boxes',
    stock: 20,
    images: ['elcb-box.jpg']
  },
  {
    name: 'Fish Tape - 30m',
    description: 'Steel fish tape for pulling cables through conduits',
    price: 3500,
    category: 'Piping Tools',
    subcategory: 'Installation Tools',
    stock: 25,
    images: ['fish-tape.jpg']
  },
  {
    name: 'Bending Spring - 20mm',
    description: 'PVC bending spring for conduit bending',
    price: 800,
    category: 'Piping Tools',
    subcategory: 'Installation Tools',
    stock: 40,
    images: ['bending-spring.jpg']
  },
  {
    name: 'Bending Spring - 25mm',
    description: 'Heavy-duty bending spring for larger conduits',
    price: 1200,
    category: 'Piping Tools',
    subcategory: 'Installation Tools',
    stock: 35,
    images: ['bending-spring.jpg']
  },
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/unh-electric-shop');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const seedProducts = async () => {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');
    
    // Insert new products
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Successfully seeded ${createdProducts.length} products`);
    
    console.log('\n📊 Products by Category:');
    const categories = {};
    createdProducts.forEach(product => {
      categories[product.category] = (categories[product.category] || 0) + 1;
    });
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    process.exit(1);
  }
};

seedProducts();

