const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
require('dotenv').config();

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Categories to create
const categories = [
  { name: 'Fittings', slug: 'fittings', description: 'Electrical fittings, switches, sockets, and cables', icon: 'plug' },
  { name: 'Lighting', slug: 'lighting', description: 'Bulbs, lamps, and lighting fixtures', icon: 'lightbulb' },
  { name: 'Kitchen Appliances', slug: 'kitchen-appliances', description: 'Refrigerators, stoves, blenders, and more', icon: 'utensils' },
  { name: 'Cleaning Appliances', slug: 'cleaning-appliances', description: 'Washing machines and vacuum cleaners', icon: 'broom' },
  { name: 'Entertainment', slug: 'entertainment', description: 'TVs, radios, speakers, and home theatre systems', icon: 'tv' },
  { name: 'Security', slug: 'security', description: 'CCTV cameras, alarms, and sensors', icon: 'shield' },
  { name: 'Power Backup', slug: 'power-backup', description: 'Generators, inverters, and solar panels', icon: 'battery' },
  { name: 'Piping Tools', slug: 'piping-tools', description: 'Junction boxes, conduit pipes, and installation tools', icon: 'wrench' }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('✅ Cleared existing products and categories\n');

    // Create categories
    console.log('📁 Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories\n`);

    // Create a map of category names to IDs
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Sample products with proper image format - EXPANDED TO USE ALL IMAGES
    const products = [
      // FITTINGS - Switches (4 products)
      {
        name: 'Wall Switch - Single Gang',
        description: 'High-quality single gang wall switch for residential and commercial use',
        price: 500,
        category: categoryMap['Fittings'],
        subcategory: 'Switches',
        stock: 100,
        images: [{ url: 'switch1.jfif', alt: 'Single Gang Switch', isPrimary: true }],
        specifications: { type: 'Single Gang', voltage: '250V', current: '10A' }
      },
      {
        name: 'Wall Switch - Double Gang',
        description: 'Durable double gang wall switch with modern design',
        price: 800,
        category: categoryMap['Fittings'],
        subcategory: 'Switches',
        stock: 80,
        images: [{ url: 'switch2.jfif', alt: 'Double Gang Switch', isPrimary: true }]
      },
      {
        name: 'Wall Switch - Triple Gang',
        description: 'Premium triple gang switch for multiple light control',
        price: 1200,
        category: categoryMap['Fittings'],
        subcategory: 'Switches',
        stock: 60,
        images: [{ url: 'switch3.jfif', alt: 'Triple Gang Switch', isPrimary: true }]
      },
      {
        name: 'Dimmer Switch',
        description: 'Modern dimmer switch for adjustable lighting',
        price: 1500,
        category: categoryMap['Fittings'],
        subcategory: 'Switches',
        stock: 50,
        images: [{ url: 'switch4.jfif', alt: 'Dimmer Switch', isPrimary: true }]
      },

      // FITTINGS - Sockets (6 products)
      {
        name: 'Power Socket - 13A Single',
        description: 'Standard 13A power socket with safety shutters',
        price: 600,
        category: categoryMap['Fittings'],
        subcategory: 'Sockets',
        stock: 120,
        images: [{ url: 'socket1.jfif', alt: '13A Power Socket', isPrimary: true }]
      },
      {
        name: 'Power Socket - 13A Double',
        description: 'Double 13A power socket for multiple devices',
        price: 900,
        category: categoryMap['Fittings'],
        subcategory: 'Sockets',
        stock: 100,
        images: [{ url: 'socket2.jfif', alt: 'Double Power Socket', isPrimary: true }]
      },
      {
        name: 'USB Power Socket',
        description: 'Modern socket with built-in USB charging ports',
        price: 1800,
        category: categoryMap['Fittings'],
        subcategory: 'Sockets',
        stock: 70,
        images: [{ url: 'socket3.jfif', alt: 'USB Power Socket', isPrimary: true }]
      },
      {
        name: 'Extension Socket - 4 Way',
        description: '4-way extension socket with surge protection',
        price: 2500,
        category: categoryMap['Fittings'],
        subcategory: 'Sockets',
        stock: 80,
        images: [{ url: 'socket4.jfif', alt: '4-Way Extension Socket', isPrimary: true }]
      },
      {
        name: 'Waterproof Socket',
        description: 'IP44 rated waterproof socket for outdoor use',
        price: 1500,
        category: categoryMap['Fittings'],
        subcategory: 'Sockets',
        stock: 40,
        images: [{ url: 'socket5.jfif', alt: 'Waterproof Socket', isPrimary: true }]
      },
      {
        name: 'Multi-Socket Extension - 6 Way',
        description: '6-way multi-socket extension with individual switches',
        price: 3500,
        category: categoryMap['Fittings'],
        subcategory: 'Sockets',
        stock: 60,
        images: [{ url: 'socket6.jfif', alt: '6-Way Multi-Socket', isPrimary: true }]
      },

      // FITTINGS - Cables & Equipment
      {
        name: 'Electrical Cable - 2.5mm',
        description: 'High-quality copper electrical cable, sold per meter',
        price: 150,
        category: categoryMap['Fittings'],
        subcategory: 'Cables & Wires',
        stock: 500,
        unit: 'meter',
        images: [{ url: 'electricalequipment.JPG', alt: 'Electrical Cable', isPrimary: true }]
      },
      {
        name: 'Electrical Equipment Set',
        description: 'Complete electrical installation equipment and accessories',
        price: 25000,
        category: categoryMap['Fittings'],
        subcategory: 'Equipment',
        stock: 15,
        images: [{ url: 'electricalequipment.JPG', alt: 'Electrical Equipment', isPrimary: true }]
      },

      // LIGHTING - Bulbs & Globes
      {
        name: 'LED Bulb - 9W',
        description: 'Energy-saving LED bulb, bright white light',
        price: 800,
        category: categoryMap['Lighting'],
        subcategory: 'Bulbs',
        stock: 150,
        images: [{ url: 'globe1.jfif', alt: 'LED Bulb 9W', isPrimary: true }],
        specifications: { wattage: '9W', color: 'White' },
        isFeatured: true
      },
      {
        name: 'LED Bulb Set - Multi Pack',
        description: 'Pack of energy-saving LED bulbs for home use',
        price: 3500,
        category: categoryMap['Lighting'],
        subcategory: 'Bulbs',
        stock: 100,
        images: [{ url: 'globes.JPG', alt: 'LED Bulb Set', isPrimary: true }]
      },

      // LIGHTING - Lamps & Panels
      {
        name: 'LED Panel Light',
        description: 'Modern LED panel light for ceiling installation',
        price: 4500,
        category: categoryMap['Lighting'],
        subcategory: 'Panel Lights',
        stock: 50,
        images: [{ url: 'ledpanel.jfif', alt: 'LED Panel Light', isPrimary: true }]
      },
      {
        name: 'Wall Bracket Light',
        description: 'Elegant wall bracket light for indoor decoration',
        price: 3500,
        category: categoryMap['Lighting'],
        subcategory: 'Wall Lights',
        stock: 40,
        images: [{ url: 'Ligtening.JPG', alt: 'Wall Bracket Light', isPrimary: true }]
      },
      {
        name: 'Decorative Light Fixture',
        description: 'Modern decorative lighting fixture for living spaces',
        price: 5500,
        category: categoryMap['Lighting'],
        subcategory: 'Decorative Lights',
        stock: 30,
        images: [{ url: 'lightenning2.JPG', alt: 'Decorative Light', isPrimary: true }]
      },

      // LIGHTING - Fans
      {
        name: 'Ceiling Fan - 56 Inch',
        description: 'Energy-efficient ceiling fan with remote control',
        price: 15000,
        category: categoryMap['Lighting'],
        subcategory: 'Fans',
        stock: 20,
        images: [{ url: 'ceilingfan1.jfif', alt: 'Ceiling Fan', isPrimary: true }],
        specifications: { size: '56 Inch', features: 'Remote Control' }
      },

      // KITCHEN APPLIANCES - Refrigerators
      {
        name: 'Refrigerator - Double Door Premium',
        description: 'Large capacity double door refrigerator with freezer and ice maker',
        price: 180000,
        category: categoryMap['Kitchen Appliances'],
        subcategory: 'Refrigerators',
        stock: 5,
        images: [{ url: 'fridge1.jfif', alt: 'Double Door Refrigerator', isPrimary: true }],
        specifications: { capacity: '350L', energyRating: 'A+' },
        isFeatured: true
      },
      {
        name: 'Refrigerator - Double Door Standard',
        description: 'Affordable double door refrigerator for family use',
        price: 150000,
        category: categoryMap['Kitchen Appliances'],
        subcategory: 'Refrigerators',
        stock: 8,
        images: [{ url: 'fridge2.jfif', alt: 'Standard Refrigerator', isPrimary: true }],
        specifications: { capacity: '300L', energyRating: 'A' }
      },

      // KITCHEN APPLIANCES - Blenders & Food Processors
      {
        name: 'Blender - 1.5L Professional',
        description: 'Powerful blender for smoothies and food processing',
        price: 12000,
        category: categoryMap['Kitchen Appliances'],
        subcategory: 'Blenders',
        stock: 30,
        images: [{ url: 'blender.JPG', alt: 'Professional Blender', isPrimary: true }]
      },

      // KITCHEN APPLIANCES - Ovens & Stoves
      {
        name: 'Electric Oven - 4 Burner',
        description: 'Modern electric oven with 4 burners and grill',
        price: 45000,
        category: categoryMap['Kitchen Appliances'],
        subcategory: 'Ovens',
        stock: 8,
        images: [{ url: 'electricoven.JPG', alt: 'Electric Oven', isPrimary: true }],
        isFeatured: true
      },

      // KITCHEN APPLIANCES - Kettles & Boilers
      {
        name: 'Electric Kettle - 1.7L',
        description: 'Fast-boiling electric kettle with auto shut-off',
        price: 5500,
        category: categoryMap['Kitchen Appliances'],
        subcategory: 'Kettles',
        stock: 40,
        images: [{ url: 'boiler1.JPG', alt: 'Electric Kettle', isPrimary: true }]
      },

      // KITCHEN APPLIANCES - Hot Plates
      {
        name: 'Hot Plate - Single Burner',
        description: 'Portable electric hot plate for cooking',
        price: 8000,
        category: categoryMap['Kitchen Appliances'],
        subcategory: 'Hot Plates',
        stock: 25,
        images: [{ url: 'hotplate.JPG', alt: 'Hot Plate', isPrimary: true }]
      },

      // KITCHEN APPLIANCES - Air Conditioners
      {
        name: 'Air Conditioner - 1.5HP',
        description: 'Energy-efficient split air conditioner for cooling',
        price: 185000,
        category: categoryMap['Kitchen Appliances'],
        subcategory: 'Air Conditioners',
        stock: 6,
        images: [{ url: 'aircondition.JPG', alt: 'Air Conditioner', isPrimary: true }],
        specifications: { power: '1.5HP', type: 'Split Unit' }
      },

      // CLEANING APPLIANCES
      {
        name: 'Washing Machine - 7kg',
        description: 'Automatic washing machine with multiple wash programs',
        price: 95000,
        category: categoryMap['Cleaning Appliances'],
        subcategory: 'Washing Machines',
        stock: 10,
        images: [{ url: 'device2.JPG', alt: 'Washing Machine', isPrimary: true }],
        specifications: { capacity: '7kg', type: 'Automatic' }
      },
      {
        name: 'Vacuum Cleaner',
        description: 'Powerful vacuum cleaner for home and office cleaning',
        price: 25000,
        category: categoryMap['Cleaning Appliances'],
        subcategory: 'Vacuum Cleaners',
        stock: 15,
        images: [{ url: 'device2.JPG', alt: 'Vacuum Cleaner', isPrimary: true }]
      },

      // ENTERTAINMENT - Televisions
      {
        name: 'LED Television - 43 Inch',
        description: 'Full HD LED television with smart features',
        price: 120000,
        category: categoryMap['Entertainment'],
        subcategory: 'Televisions',
        stock: 10,
        images: [{ url: 'flatscreentv.JPG', alt: 'LED Television', isPrimary: true }],
        specifications: { size: '43 Inch', resolution: '1920x1080', smart: 'Yes' },
        isFeatured: true
      },

      // ENTERTAINMENT - Speakers
      {
        name: 'Home Theatre System - 5.1 Channel',
        description: '5.1 channel home theatre system with powerful subwoofer',
        price: 65000,
        category: categoryMap['Entertainment'],
        subcategory: 'Home Theatre',
        stock: 8,
        images: [{ url: 'speaker1.JPG', alt: 'Home Theatre System', isPrimary: true }]
      },
      {
        name: 'Bluetooth Speaker - Portable',
        description: 'Portable Bluetooth speaker with powerful bass and long battery life',
        price: 8500,
        category: categoryMap['Entertainment'],
        subcategory: 'Speakers',
        stock: 45,
        images: [{ url: 'speaker2.JPG', alt: 'Bluetooth Speaker', isPrimary: true }]
      },

      // SECURITY - Alarms & Sensors
      {
        name: 'Smoke Detector',
        description: 'Sensitive smoke detector with loud alarm',
        price: 4500,
        category: categoryMap['Security'],
        subcategory: 'Smoke Detectors',
        stock: 30,
        images: [{ url: 'device2.JPG', alt: 'Smoke Detector', isPrimary: true }]
      },
      {
        name: 'CCTV Camera - HD',
        description: 'High-definition CCTV camera with night vision',
        price: 15000,
        category: categoryMap['Security'],
        subcategory: 'CCTV Cameras',
        stock: 25,
        images: [{ url: 'device2.JPG', alt: 'CCTV Camera', isPrimary: true }],
        specifications: { resolution: '1080p', nightVision: 'Yes' }
      },

      // POWER BACKUP - Generators
      {
        name: 'Generator - 2.5KVA',
        description: 'Reliable petrol generator for home and office use',
        price: 85000,
        category: categoryMap['Power Backup'],
        subcategory: 'Generators',
        stock: 6,
        images: [{ url: 'generator.JPG', alt: 'Generator 2.5KVA', isPrimary: true }],
        specifications: { power: '2.5KVA', fuel: 'Petrol' },
        isFeatured: true
      },

      // POWER BACKUP - Solar Panels (5 products using all solar images)
      {
        name: 'Solar Panel - 100W Monocrystalline',
        description: 'High-efficiency 100W monocrystalline solar panel',
        price: 35000,
        category: categoryMap['Power Backup'],
        subcategory: 'Solar Panels',
        stock: 20,
        images: [{ url: 'solar1.jfif', alt: 'Solar Panel 100W', isPrimary: true }],
        specifications: { power: '100W', type: 'Monocrystalline' }
      },
      {
        name: 'Solar Panel - 150W',
        description: 'Premium 150W solar panel for medium installations',
        price: 50000,
        category: categoryMap['Power Backup'],
        subcategory: 'Solar Panels',
        stock: 18,
        images: [{ url: 'solar2.JPG', alt: 'Solar Panel 150W', isPrimary: true }],
        specifications: { power: '150W', type: 'Polycrystalline' }
      },
      {
        name: 'Solar Panel - 200W',
        description: 'High-capacity 200W solar panel for larger systems',
        price: 65000,
        category: categoryMap['Power Backup'],
        subcategory: 'Solar Panels',
        stock: 15,
        images: [{ url: 'solar3.JPG', alt: 'Solar Panel 200W', isPrimary: true }],
        specifications: { power: '200W', type: 'Monocrystalline' }
      },
      {
        name: 'Solar Panel - 250W Premium',
        description: 'Premium 250W solar panel with high efficiency rating',
        price: 80000,
        category: categoryMap['Power Backup'],
        subcategory: 'Solar Panels',
        stock: 12,
        images: [{ url: 'solar4.JPG', alt: 'Solar Panel 250W', isPrimary: true }],
        specifications: { power: '250W', type: 'Monocrystalline', efficiency: '20%' }
      },
      {
        name: 'Solar Panel - 300W Industrial',
        description: 'Industrial-grade 300W solar panel for commercial use',
        price: 95000,
        category: categoryMap['Power Backup'],
        subcategory: 'Solar Panels',
        stock: 10,
        images: [{ url: 'solar5.JPG', alt: 'Solar Panel 300W', isPrimary: true }],
        specifications: { power: '300W', type: 'Monocrystalline', efficiency: '22%' },
        isFeatured: true
      },

      // PIPING TOOLS - Junction Boxes
      {
        name: 'Junction Box - 4x4 Standard',
        description: 'Standard 4x4 junction box for electrical connections',
        price: 400,
        category: categoryMap['Piping Tools'],
        subcategory: 'Junction Boxes',
        stock: 100,
        images: [{ url: 'junctionbox.JPG', alt: 'Junction Box 4x4', isPrimary: true }]
      },
      {
        name: 'Knockout Box - Single Gang',
        description: 'Single gang knockout electrical box for wall mounting',
        price: 350,
        category: categoryMap['Piping Tools'],
        subcategory: 'Junction Boxes',
        stock: 80,
        images: [{ url: 'nockoutbox.JPG', alt: 'Knockout Box', isPrimary: true }]
      },
      {
        name: 'Knockout Box - Double Gang',
        description: 'Double gang knockout box for multiple connections',
        price: 500,
        category: categoryMap['Piping Tools'],
        subcategory: 'Junction Boxes',
        stock: 70,
        images: [{ url: 'nockoutbox2.JPG', alt: 'Double Gang Knockout Box', isPrimary: true }]
      },

      // PIPING TOOLS - Connectors
      {
        name: 'Electrical Connector Set',
        description: 'Set of electrical connectors for various applications',
        price: 800,
        category: categoryMap['Piping Tools'],
        subcategory: 'Connectors',
        stock: 150,
        images: [{ url: 'connector.JPG', alt: 'Electrical Connectors', isPrimary: true }]
      },

      // PIPING TOOLS - Conduit Pipes
      {
        name: 'PVC Conduit Pipe - 20mm',
        description: 'Durable 20mm PVC conduit pipe for cable protection',
        price: 200,
        category: categoryMap['Piping Tools'],
        subcategory: 'Conduit Pipes',
        stock: 300,
        unit: 'meter',
        images: [{ url: 'conductpipes.JPG', alt: 'PVC Conduit Pipe 20mm', isPrimary: true }]
      },
      {
        name: 'PVC Conduit Pipe - 25mm',
        description: 'Heavy-duty 25mm PVC conduit pipe for larger cables',
        price: 280,
        category: categoryMap['Piping Tools'],
        subcategory: 'Conduit Pipes',
        stock: 250,
        unit: 'meter',
        images: [{ url: 'conductpipes2.JPG', alt: 'PVC Conduit Pipe 25mm', isPrimary: true }]
      },

      // PIPING TOOLS - Installation Tools
      {
        name: 'Electrical Tool Set - Professional',
        description: 'Complete professional electrical installation tool set',
        price: 15000,
        category: categoryMap['Piping Tools'],
        subcategory: 'Installation Tools',
        stock: 25,
        images: [{ url: 'tool.JPG', alt: 'Professional Tool Set', isPrimary: true }]
      }
    ];

    // Insert products
    console.log('📦 Creating products...');
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Successfully seeded ${createdProducts.length} products\n`);

    // Summary by category
    console.log('📊 Summary:');
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Total Products: ${createdProducts.length}`);
    console.log(`   Featured Products: ${createdProducts.filter(p => p.isFeatured).length}\n`);

    console.log('📦 Products by Category:');
    createdCategories.forEach(cat => {
      const count = createdProducts.filter(p => p.category.toString() === cat._id.toString()).length;
      console.log(`   ${cat.name}: ${count} products`);
    });

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

