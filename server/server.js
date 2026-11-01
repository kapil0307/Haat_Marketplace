require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// Add security headers support.
const helmet = require("helmet");
// Add authentication rate limiting support.
const rateLimit = require("express-rate-limit");
// Add MongoDB operator sanitization support.
const mongoSanitize = require("express-mongo-sanitize");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
// Add secure HTTP response headers.
app.use(helmet());
// Sanitize request data before it reaches MongoDB queries.
app.use(mongoSanitize());
// Limit authentication attempts from each IP address.
app.use("/api/auth", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many authentication attempts. Please try again later." },
}));

app.get("/", (req, res) => res.send("Haat API running"));
// Provide a lightweight endpoint for service health checks.
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products/:productId/reviews", require("./routes/reviews"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));

// Hide internal error details in production responses.
app.use((err, req, res, next) => {
  const message = process.env.NODE_ENV === "production" ? "Internal server error" : err.message;
  res.status(500).json({ message });
});


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => console.log("Server running"));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
