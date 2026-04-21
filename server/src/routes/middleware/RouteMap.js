const express = require("express");
const { expressjwt: jwt } = require("express-jwt");

const AuthenticationError = require("../../errorHandlers/AuthenticationError");

const Router = express.Router();
const openRouter = express.Router();

class RouteMap {
  static setupRoutes(app) {

    // 🔓 OPEN ROUTES
    app.use("/open/api", openRouter);
    openRouter.use("/auth", require("../routers/authRouter"));
    
    // 🔐 PROTECTED ROUTES
    app.use(
      "/api",
      RouteMap._authMiddleware,
      RouteMap._attachUser,
      Router
    );
    Router.use("/skills", require("../routers/skillRouter"));
    
    // Example protected route
    Router.get("/me", (req, res) => {
      res.json({
        success: true,
        user: req.user
      });
    });

    // JWT Error handler
    app.use((err, req, res, next) => {
      if (err.name === "UnauthorizedError") {
        return next(new AuthenticationError("Invalid or missing token"));
      }
      next(err);
    });

    // 404
    app.use((req, res) => {
      res.status(404).json({
        message: "Route not found"
      });
    });
  }

  static _authMiddleware = jwt({
    secret: process.env.JWT_SECRET_KEY,
    algorithms: ["HS256"],
    getToken: (req) => {
      if (req.headers.authorization?.startsWith("Bearer ")) {
        return req.headers.authorization.split(" ")[1];
      }
      return null;
    }
  });

  static _attachUser = (req, res, next) => {
    req.user = {
      id: req.auth.user_id
    };
    next();
  };
}

module.exports = RouteMap;