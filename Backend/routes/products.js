const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

// ============================================
// @route   GET /api/products
// @desc    Get all products (public or user's products)
// @access  Public / Private
// ============================================
router.get("/", async (req, res) => {
  try {
    const { isPublished, userId, search, type } = req.query;

    // Build filter
    let filter = {};

    if (isPublished !== undefined) {
      filter.isPublished = isPublished === "true";
    }

    if (userId) {
      filter.userId = userId;
    }

    if (type) {
      filter.productType = type;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const products = await Product.find(filter)
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving products",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// ============================================
// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
// ============================================
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("userId", "name email phone");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// ============================================
// @route   POST /api/products
// @desc    Create a new product (with optional image upload)
// @access  Private
// ============================================
router.post(
  "/",
  protect,
  upload.array("images", 10),
  [
    body("productName").notEmpty().withMessage("Product name is required"),
    body("productType")
      .isIn(["Foods", "Electronics", "Clothes", "Beauty Products", "Others"])
      .withMessage("Invalid product type"),
    body("quantityStock")
      .isInt({ min: 0 })
      .withMessage("Quantity stock must be a positive number"),
    body("mrp")
      .isFloat({ min: 0 })
      .withMessage("MRP must be a positive number"),
    body("sellingPrice")
      .isFloat({ min: 0 })
      .withMessage("Selling price must be a positive number"),
    body("brandName").notEmpty().withMessage("Brand name is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    try {
      const { productName, productType, quantityStock, mrp, sellingPrice, brandName, exchangeOrReturnEligibility } = req.body;

      // Prepare images array
      const images = (req.files || []).map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        url: `http://localhost:${process.env.PORT || 5000}/uploads/products/${file.filename}`,
        size: file.size,
      }));

      // Create product
      const product = new Product({
        userId: req.user._id,
        productName: productName.trim(),
        productType,
        quantityStock: parseInt(quantityStock),
        mrp: parseFloat(mrp),
        sellingPrice: parseFloat(sellingPrice),
        brandName: brandName.trim(),
        exchangeOrReturnEligibility: exchangeOrReturnEligibility || "Yes",
        images,
        isPublished: false,
      });

      await product.save();

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating product",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// ============================================
// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (only owner)
// ============================================
router.put(
  "/:id",
  protect,
  upload.array("images", 10),
  [
    body("productName").optional().notEmpty().withMessage("Product name cannot be empty"),
    body("productType")
      .optional()
      .isIn(["Foods", "Electronics", "Clothes", "Beauty Products", "Others"])
      .withMessage("Invalid product type"),
    body("quantityStock")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Quantity stock must be a positive number"),
    body("mrp")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("MRP must be a positive number"),
    body("sellingPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Selling price must be a positive number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Check authorization
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this product",
        });
      }

      // Update fields
      const { productName, productType, quantityStock, mrp, sellingPrice, brandName, exchangeOrReturnEligibility, isPublished } = req.body;

      if (productName) product.productName = productName.trim();
      if (productType) product.productType = productType;
      if (quantityStock !== undefined) product.quantityStock = parseInt(quantityStock);
      if (mrp) product.mrp = parseFloat(mrp);
      if (sellingPrice) product.sellingPrice = parseFloat(sellingPrice);
      if (brandName) product.brandName = brandName.trim();
      if (exchangeOrReturnEligibility) product.exchangeOrReturnEligibility = exchangeOrReturnEligibility;

      // Handle publish/unpublish
      if (isPublished !== undefined) {
        const newPublishState = isPublished === "true" || isPublished === true;
        if (newPublishState && !product.isPublished) {
          product.publishedAt = new Date();
        } else if (!newPublishState && product.isPublished) {
          product.publishedAt = null;
        }
        product.isPublished = newPublishState;
      }

      // Add new images if uploaded
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file) => ({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          url: `http://localhost:${process.env.PORT || 5000}/uploads/products/${file.filename}`,
          size: file.size,
        }));
        product.images = [...product.images, ...newImages];
      }

      await product.save();

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating product",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// ============================================
// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (only owner)
// ============================================
router.delete("/:id", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check authorization
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this product",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// ============================================
// @route   GET /api/products/user/:userId
// @desc    Get all products by a specific user
// @access  Public
// ============================================
router.get("/user/:userId", async (req, res) => {
  try {
    const products = await Product.find({ userId: req.params.userId })
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "User products retrieved successfully",
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get user products error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving user products",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;