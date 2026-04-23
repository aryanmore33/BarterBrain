const express = require("express");
const router = express.Router();

const chatService = require("../../models/utils/chatService");
const { appWrapper } = require("../routeWrapper");

// ===============================
// GET CHAT HISTORY
// ===============================
router.get(
  "/:barterId/messages",
  appWrapper(async (req) => {
    const userId = req.user.id;
    const { barterId } = req.params;

    // 🔐 validate access
    const isAllowed = await chatService.validateBarterAccess(
      userId,
      barterId
    );

    if (!isAllowed) {
      throw new Error("Unauthorized access to chat");
    }

    const messages = await chatService.getMessages(barterId);

    return {
      success: true,
      data: messages
    };
  })
);

module.exports = router;