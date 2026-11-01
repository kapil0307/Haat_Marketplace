const express = require("express");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");
const { protect, allow } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

router.get("/", async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("buyer", "name")
    .sort({ createdAt: -1 });
  res.json(reviews);
});

router.post("/", protect, allow("buyer"), async (req, res) => {
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be an integer from 1 to 5" });
  }
  const comment = req.body.comment === undefined ? "" : req.body.comment;
  if (typeof comment !== "string" || comment.length > 500) {
    return res.status(400).json({ message: "Comment must be 500 characters or fewer" });
  }

  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  // Only buyers who purchased this product can submit a review.
  const purchased = await Order.exists({ buyer: req.user._id, "items.product": product._id });
  if (!purchased) return res.status(403).json({ message: "Only buyers of this item can review it" });

  try {
    const review = await Review.create({
      product: product._id,
      buyer: req.user._id,
      rating,
      comment,
    });

    // Recalculate the product rating from all of its reviews.
    const [summary] = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: "$product", ratingAvg: { $avg: "$rating" }, ratingCount: { $sum: 1 } } },
    ]);
    await Product.findByIdAndUpdate(product._id, {
      ratingAvg: summary.ratingAvg,
      ratingCount: summary.ratingCount,
    });

    res.status(201).json(await review.populate("buyer", "name"));
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "You have already reviewed this item" });
    throw err;
  }
});

module.exports = router;
