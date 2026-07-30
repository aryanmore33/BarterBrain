const express = require("express");
const { expressjwt: jwt } = require("express-jwt");

const AuthenticationError = require("../../errorHandlers/AuthenticationError");
const AuthModel = require("../../models/AuthModel");

const Router = express.Router();
const openRouter = express.Router();

class RouteMap {

  static setupRoutes(app) {
    app.get("/ping", (req, res) => {
      // console.log("PING HIT");
      res.json({ ok: true });
    });

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
    Router.use("/barter", require("../routers/barterRouter"));
    Router.use("/chat", require("../routers/chatRouter"));
    Router.use("/call", require("../routers/callRouter"));
    Router.use("/keys", require("../routers/keyRoutes"));
    Router.use("/chat-keys", require("../routers/chatKeyRoutes"));
    Router.use("/match", require("../routers/matchRouter"));
    Router.use("/reviews", require("../routers/reviewRouter"));

    // Example protected route
    Router.get("/me", (req, res) => {
      res.json({
        success: true,
        user: req.user
      });
    });
  }

  static _authMiddleware = jwt({
    secret: process.env.JWT_SECRET_KEY || process.env.JWT_SECRET,
    algorithms: ["HS256"],
    getToken: (req) => {
      // 1. Check Authorization header
      if (req.headers.authorization?.startsWith("Bearer ")) {
        return req.headers.authorization.split(" ")[1];
      }
      // 2. Check cookies
      if (req.cookies?.token) {
        return req.cookies.token;
      }
      return null;
    }
  });


  static _attachUser = async (req, res, next) => {
    try {
      const userModel = new AuthModel();

      const user = await userModel.findById(req.auth.user_id);

      if (!user) {
        return next(new AuthenticationError("User not found"));
      }

      delete user.password;

      req.user = user;

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = RouteMap;