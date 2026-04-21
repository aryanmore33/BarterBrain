const express = require("express");
const router = express.Router();

const BarterManager = require("../../businessLogic/managers/BarterManager");
const { appWrapper } = require("../routeWrapper");

// ===============================
// CREATE REQUEST
// ===============================
router.post(
  "/request",
  appWrapper(async (req) => {
    const userId = req.user.id;

    const data = await BarterManager.createRequest(userId, req.body);

    return {
      success: true,
      data,
      message: "Request sent successfully"
    };
  })
);

// ===============================
// GET REQUESTS
// ===============================
router.get(
  "/requests",
  appWrapper(async (req) => {
    const userId = req.user.id;

    const data = await BarterManager.getRequests(userId);

    return {
      success: true,
      data
    };
  })
);

// ===============================
// ACCEPT / REJECT / CANCEL
// ===============================
router.patch(
  "/:id",
  appWrapper(async (req) => {
    const userId = req.user.id;
    const { status } = req.body;

    const data = await BarterManager.updateRequestStatus(
      userId,
      req.params.id,
      status
    );

    return {
      success: true,
      data,
      message: `Request ${status}`
    };
  })
);

// ===============================
// COMPLETE REQUEST
// ===============================
router.patch(
  "/:id/complete",
  appWrapper(async (req) => {
    const userId = req.user.id;

    const data = await BarterManager.completeRequest(
      userId,
      req.params.id
    );

    return {
      success: true,
      data,
      message: "Barter completed"
    };
  })
);

module.exports = router;