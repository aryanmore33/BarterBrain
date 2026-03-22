const express = require("express");
const { expressjwt: jwt } = require("express-jwt");

const AuthenticationError = require("../../errorHandlers/AuthenticationError");

const Router = express.Router();
const openRouter = express.Router();

class RouteMap {
  static setupRoutes(app) {

    // 🔓 OPEN ROUTES (no auth)
    app.use("/open/api", openRouter);

    // Example:
    // openRouter.use("/auth", require("../routes/authRoutes"));

// confirm

    // 🔐 PROTECTED ROUTES (JWT required)
    app.use(
      "/api",
      RouteMap._authMiddleware,
      Router
    );

    // Example:
    // Router.use("/users", require("../routes/userRoutes"));



    // ❌ 404 Handler
    app.use((req, res) => {
      res.status(404).json({
        message: "Route not found"
      });
    });
  }

  // 🔐 JWT Middleware
  static _authMiddleware = [
    jwt({
      secret: process.env.JWT_SECRET_KEY,
      algorithms: ["HS256"],
      getToken: (req) => {
        if (req.headers.authorization?.startsWith("Bearer ")) {
          return req.headers.authorization.split(" ")[1];
        }
        return null;
      }
    }),

    // Handle JWT errors
    (err, req, res, next) => {
      if (err.name === "UnauthorizedError") {
        return next(new AuthenticationError("Invalid or missing token"));
      }
      next(err);
    }
  ];
}

module.exports = RouteMap;