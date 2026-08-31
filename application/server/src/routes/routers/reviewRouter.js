const express = require("express");
const router = express.Router();

const ReviewManager = require("../../businessLogic/managers/reviewManager");
const { appWrapper } = require("../routeWrapper");

// =========================
// ADD REVIEW
// =========================
router.post(
  "/",
  appWrapper(async (req) => {

    const userId = req.user.id;

    const review = await ReviewManager.addReview(userId, req.body);

    return {
      success: true,
      data: review,
      message: "Review added"
    };
  })
);

// =========================
// GET USER PROFILE (rating + reviews)
// =========================
router.get(
  "/:userId",
  appWrapper(async (req) => {

    const { userId } = req.params;

    const data = await ReviewManager.getUserProfile(userId);

    return {
      success: true,
      data
    };
  })
);

module.exports = router;