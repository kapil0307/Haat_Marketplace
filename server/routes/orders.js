const express = require("express");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect, allow } = require("../middleware/auth");

const router = express.Router();

// Buyer: checkout. body: { items: [{ productId, qty }] }
router.post("/", protect, allow("buyer"), async (req, res) => {
  const requested = req.body.items || [];
  if (!requested.length) return res.status(400).json({ message: "Your cart is empty" });

  const taken = []; // stock already reduced, so we can undo it if a later item fails
  try {
    const items = [];
    for (const { productId, qty } of requested) {
      const q = Number(qty);
      if (!Number.isInteger(q) || q < 1) throw new Error("Invalid quantity");

      // Atomic: only reduces stock if enough is left, so two buyers can't oversell.
      const product = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: q } },
        { $inc: { stock: -q } },
        { new: true }
      );
      if (!product) throw new Error("An item is out of stock or no longer available");
      taken.push({ productId, q });

      if (String(product.seller) === String(req.user._id))
        throw new Error("You cannot buy your own product");

      items.push({ product: product._id, title: product.title, price: product.price, qty: q, seller: product.seller });
    }
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const order = await Order.create({ buyer: req.user._id, items, total });
    res.status(201).json(order);
  } catch (err) {
    for (const t of taken) await Product.findByIdAndUpdate(t.productId, { $inc: { stock: t.q } });
    res.status(400).json({ message: err.message });
  }
});

// Buyer: my purchases
router.get("/mine", protect, allow("buyer"), async (req, res) => {
  res.json(await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 }));
});

// Seller: my items that were bought
router.get("/sales", protect, allow("seller"), async (req, res) => {
  const orders = await Order.find({ "items.seller": req.user._id })
    .populate("buyer", "name email")
    .sort({ createdAt: -1 });
  const sales = orders.flatMap((o) =>
    o.items
      .filter((i) => String(i.seller) === String(req.user._id))
      .map((i) => ({
        orderId: o._id,
        productId: i.product,
        date: o.createdAt,
        buyer: o.buyer,
        title: i.title,
        price: i.price,
        qty: i.qty,
        status: i.status || "placed",
      }))
  );
  res.json(sales);
});

// Seller status updates may only move an item forward through its delivery flow.
router.put("/:orderId/items/:productId/status", protect, allow("seller"), async (req, res) => {
  const allowedStatuses = ["placed", "shipped", "delivered"];
  if (!allowedStatuses.includes(req.body.status)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  let order;
  try {
    order = await Order.findById(req.params.orderId);
  } catch {
    return res.status(404).json({ message: "Order not found" });
  }
  if (!order) return res.status(404).json({ message: "Order not found" });

  const item = order.items.find((i) => String(i.product) === req.params.productId);
  if (!item) return res.status(404).json({ message: "Order item not found" });
  if (String(item.seller) !== String(req.user._id)) {
    return res.status(403).json({ message: "This item is not yours" });
  }

  const currentIndex = allowedStatuses.indexOf(item.status || "placed");
  const nextIndex = allowedStatuses.indexOf(req.body.status);
  if (nextIndex !== currentIndex + 1) {
    return res.status(400).json({ message: "Order status can only move forward one step" });
  }

  item.status = req.body.status;
  await order.save();
  res.json({ message: "Order status updated", status: item.status });
});

module.exports = router;
