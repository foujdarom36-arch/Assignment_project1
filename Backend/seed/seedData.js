require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");

const connectDB = async () => {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/productr"
  );
  console.log("✅ MongoDB Connected for seeding");
};

const seedUsers = [
  {
    name: "Rahul Sharma",
    email: "rahul@example.com",
    phone: "9876543210",
    isVerified: true,
    isActive: true,
  },
  {
    name: "Priya Singh",
    email: "priya@example.com",
    phone: "8765432109",
    isVerified: true,
    isActive: true,
  },
];

const seedProducts = (userId) => [
  {
    userId,
    productName: "CakeZone Walnut Brownie",
    productType: "Foods",
    quantityStock: 200,
    mrp: 2000,
    sellingPrice: 1500,
    brandName: "CakeZone",
    images: [
      {
        filename: "walnut-brownie.jpg",
        originalName: "walnut-brownie.jpg",
        path: "uploads/products/walnut-brownie.jpg",
        url: "http://localhost:5000/uploads/products/walnut-brownie.jpg",
        size: 102400,
      },
    ],
    exchangeOrReturnEligibility: "Yes",
    isPublished: false,
  },
  {
    userId,
    productName: "CakeZone Choco Fudge Brownie",
    productType: "Foods",
    quantityStock: 200,
    mrp: 23,
    sellingPrice: 80,
    brandName: "CakeZone",
    images: [
      {
        filename: "choco-fudge.jpg",
        originalName: "choco-fudge.jpg",
        path: "uploads/products/choco-fudge.jpg",
        url: "http://localhost:5000/uploads/products/choco-fudge.jpg",
        size: 92400,
      },
    ],
    exchangeOrReturnEligibility: "Yes",
    isPublished: true,
    publishedAt: new Date(),
  },
  {
    userId,
    productName: "Theobroma Christmas Cake",
    productType: "Foods",
    quantityStock: 200,
    mrp: 23,
    sellingPrice: 80,
    brandName: "CakeZone",
    images: [
      {
        filename: "christmas-cake.jpg",
        originalName: "christmas-cake.jpg",
        path: "uploads/products/christmas-cake.jpg",
        url: "http://localhost:5000/uploads/products/christmas-cake.jpg",
        size: 88000,
      },
    ],
    exchangeOrReturnEligibility: "Yes",
    isPublished: false,
  },
  {
    userId,
    productName: "Samsung Galaxy Buds Pro",
    productType: "Electronics",
    quantityStock: 50,
    mrp: 15000,
    sellingPrice: 11999,
    brandName: "Samsung",
    images: [],
    exchangeOrReturnEligibility: "Yes",
    isPublished: true,
    publishedAt: new Date(),
  },
  {
    userId,
    productName: "Levi's 511 Slim Fit Jeans",
    productType: "Clothes",
    quantityStock: 100,
    mrp: 3999,
    sellingPrice: 2999,
    brandName: "Levi's",
    images: [],
    exchangeOrReturnEligibility: "Yes",
    isPublished: false,
  },
  {
    userId,
    productName: "Lakme Face Magic Serum",
    productType: "Beauty Products",
    quantityStock: 300,
    mrp: 499,
    sellingPrice: 399,
    brandName: "Lakme",
    images: [],
    exchangeOrReturnEligibility: "No",
    isPublished: true,
    publishedAt: new Date(),
  },
];

const runSeed = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Seed users
    const createdUsers = await User.insertMany(seedUsers);
    console.log(`👥 Created ${createdUsers.length} users`);

    // Seed products for first user
    const firstUser = createdUsers[0];
    const products = seedProducts(firstUser._id);
    const createdProducts = await Product.insertMany(products);
    console.log(`📦 Created ${createdProducts.length} products for user: ${firstUser.name}`);

    console.log("\n✅ Seed completed successfully!");
    console.log("\n📋 Test Credentials:");
    console.log("   Email: rahul@example.com");
    console.log("   Phone: 9876543210");
    console.log("   (Use /api/auth/login to get OTP, then /api/auth/verify-otp to login)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

runSeed();