const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    title: String, // snapshot, so old orders stay correct if the product changes
    price: Number,
    qty: Number,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["placed", "shipped", "delivered"], default: "placed" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [itemSchema],
    total: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
