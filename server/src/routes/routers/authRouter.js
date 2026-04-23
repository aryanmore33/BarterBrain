const express = require("express");
const router = express.Router();
const { ACCESS_ROLES } = require("../../businessLogic/accessmanagement/roleConstants");
const AuthenticationManager = require("../../businessLogic/managers/authManager");
const {appWrapper} = require("../../routes/routeWrapper");

// REGISTER
router.post(
  "/register",
  appWrapper(async (req) => {
    const user = await AuthenticationManager.registerUser(req.body);

    return {
      success: true,
      data: user,
      message: "User registered successfully"
    };
  })
);

// LOGIN
router.post(
  "/login",
  appWrapper(async (req, res) => {
    const data = await AuthenticationManager.loginUser(req.body);

    // 🍪 Set cookie
    res.cookie("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return {
      success: true,
      data: data.user,
      message: "Login successful"
    };
  })
);

// LOGOUT
router.post(
  "/logout",
  appWrapper(async (req, res) => {
    res.clearCookie("token");
    return {
      success: true,
      message: "Logged out successfully"
    };
  })
);

module.exports = router;