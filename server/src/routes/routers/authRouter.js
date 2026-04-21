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
  }, [ACCESS_ROLES.ALL]) // allow all for registration
);

// LOGIN
router.post(
  "/login",
  appWrapper(async (req) => {
    const data = await AuthenticationManager.loginUser(req.body);

    return {
      success: true,
      data,
      message: "Login successful"
    };
  })
);

module.exports = router;