require("dotenv").config();

const { initSocket } = require("./src/models/utils/socket");
const express = require("express");
const http = require("http"); // 🔥 IMPORTANT
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");

const RouteMap = require("./src/routes/middleware/RouteMap");
const ErrorHandler = require("./src/errorHandlers/ErrorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// 🌍 CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// 📄 Logger
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

// 📦 Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 🍪 Cookies
app.use(cookieParser());

// 📁 File Upload
app.use(
  fileUpload({
    limits: { fileSize: 20 * 1024 * 1024 },
  })
);

// 📂 Static files
app.use(express.static(path.join(__dirname, "public")));

// 🚀 Routes
RouteMap.setupRoutes(app);

// ❌ 404
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// ⚠️ Error handler
app.use(ErrorHandler.handleError);

// ==========================
// 🔥 CREATE SERVER
// ==========================
const server = http.createServer(app);

// 🔥 ATTACH SOCKET HERE
initSocket(server);

// ▶️ Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;