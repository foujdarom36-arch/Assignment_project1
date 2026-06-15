const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    productType: {
      type: String,
      required: [true, "Product type is required"],
      enum: {
        values: ["Foods", "Electronics", "Clothes", "Beauty Products", "Others"],
        message: "Product type must be one of: Foods, Electronics, Clothes, Beauty Products, Others",
      },
    },
    quantityStock: {
      type: Number,
      required: [true, "Quantity stock is required"],
      min: [0, "Quantity stock cannot be negative"],
    },
    mrp: {
      type: Number,
      required: [true, "MRP is required"],
      min: [0, "MRP cannot be negative"],
    },
    sellingPrice: {
      type: Number,
      required: [true, "Selling price is required"],
      min: [0, "Selling price cannot be negative"],
    },
    brandName: {
      type: String,
      required: [true, "Brand name is required"],
      trim: true,
      maxlength: [100, "Brand name cannot exceed 100 characters"],
    },
    images: [
      {
        filename: { type: String },
        originalName: { type: String },
        path: { type: String },
        url: { type: String },
        size: { type: Number },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    exchangeOrReturnEligibility: {
      type: String,
      enum: {
        values: ["Yes", "No"],
        message: "Exchange or return eligibility must be Yes or No",
      },
      default: "Yes",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for total number of images
ProductSchema.virtual("totalImages").get(function () {
  return this.images ? this.images.length : 0;
});

// Index for search and filter
ProductSchema.index({ userId: 1, isPublished: 1 });
ProductSchema.index({ productName: "text", brandName: "text" });

module.exports = mongoose.model("Product", ProductSchema);