const express = require("express");
const Product = require("../models/Product");
const { protect, allow } = require("../middleware/auth");

const router = express.Router();
const fields = ["title", "description", "price", "stock", "category", "image"];
const pick = (body) => Object.fromEntries(fields.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

// Public: browse and search
router.get("/", async (req, res) => {
  const { search, category } = req.query;
  const pageValue = Number(req.query.page);
  const limitValue = Number(req.query.limit);
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const limit = Number.isInteger(limitValue) && limitValue > 0 && limitValue <= 50 ? limitValue : 12;
  const sortBy = ["newest", "price_asc", "price_desc"].includes(req.query.sort) ? req.query.sort : "newest";
  const filter = {};
  if (search) filter.title = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  if (category && category !== "All") filter.category = category;
  // Apply validated pagination and sorting to the filtered product list.
  const sort = sortBy === "price_asc" ? { price: 1 } : sortBy === "price_desc" ? { price: -1 } : { createdAt: -1 };
  const [products, total] = await Promise.all([
    Product.find(filter).populate("seller", "name").sort(sort).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);
  res.json({ products, page, totalPages: Math.max(1, Math.ceil(total / limit)), total });
});

// Seller: my own listings (must be above "/:id")
router.get("/mine", protect, allow("seller"), async (req, res) => {
  res.json(await Product.find({ seller: req.user._id }).sort({ createdAt: -1 }));
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("seller", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch {
    res.status(400).json({ message: "Invalid product id" });
  }
});

router.post("/", protect, allow("seller"), async (req, res) => {
  try {
    const product = await Product.create({ ...pick(req.body), seller: req.user._id });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Ownership check: a seller can only change their own products.
// Returns the product, or sends an error response and returns null.
const ownProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return null;
    }
    if (String(product.seller) !== String(req.user._id)) {
      res.status(403).json({ message: "This is not your product" });
      return null;
    }
    return product;
  } catch {
    res.status(400).json({ message: "Invalid product id" });
    return null;
  }
};

router.put("/:id", protect, allow("seller"), async (req, res) => {
  const product = await ownProduct(req, res);
  if (!product) return;
  Object.assign(product, pick(req.body));
  try {
    res.json(await product.save());
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", protect, allow("seller"), async (req, res) => {
  const product = await ownProduct(req, res);
  if (!product) return;
  await product.deleteOne();
  res.json({ message: "Deleted" });
});

module.exports = router;
