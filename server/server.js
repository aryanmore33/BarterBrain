// server.js
require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");

const RouteMap = require("./src/routes/middleware/RouteMap");
const ErrorHandler = require("./src/errorHandlers/ErrorHandler");

const app = express();
const PORT = process.env.PORT || 5000;


// 🌍 CORS (simple + production safe)
app.use(
  cors({
    origin: true, // allow all (restrict in production if needed)
    credentials: true,
  })
);


// 📄 Logger (cleaned)
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);


// 📦 Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));


// 🍪 Cookies
app.use(cookieParser());


// 📁 File Upload (optional)
app.use(
  fileUpload({
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  })
);


// 📂 Static files (optional)
app.use(express.static(path.join(__dirname, "public")));


// 🚀 Routes
RouteMap.setupRoutes(app);


// ❌ 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});


// ⚠️ Global Error Handler
app.use(ErrorHandler.handleError);


// ▶️ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


module.exports = app;