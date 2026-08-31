const express = require("express");
const router = express.Router();

const ChatManager = require("../../businessLogic/managers/chatManager");
const { appWrapper } = require("../routeWrapper");

// ======================================================
// GET CHAT HISTORY
// ======================================================

router.get(
    "/:barterId/messages",
    appWrapper(async (req) => {

        const chatManager = new ChatManager(req.user.id);

        const messages = await chatManager.getMessages({
            barterId: req.params.barterId,
            limit: Number(req.query.limit) || 50,
            offset: Number(req.query.offset) || 0
        });

        return {
            success: true,
            data: messages
        };

    })
);

// ======================================================
// GET SINGLE MESSAGE
// ======================================================

router.get(
    "/message/:messageId",
    appWrapper(async (req) => {

        const chatManager = new ChatManager(req.user.id);

        const message = await chatManager.getMessage(
            req.params.messageId
        );

        return {
            success: true,
            data: message
        };

    })
);

// ======================================================
// GET MESSAGE RECEIPTS
// ======================================================

router.get(
    "/message/:messageId/receipts",
    appWrapper(async (req) => {

        const chatManager = new ChatManager(req.user.id);

        const receipts = await chatManager.getReceipts(
            req.params.messageId
        );

        return {
            success: true,
            data: receipts
        };

    })
);

// ======================================================
// GET USER PRESENCE
// ======================================================

router.get(
    "/presence/:userId",
    appWrapper(async (req) => {

        const chatManager = new ChatManager(req.user.id);

        const presence = await chatManager.getPresence(
            req.params.userId
        );

        return {
            success: true,
            data: presence
        };

    })
);

// ======================================================
// GET UNREAD COUNT
// ======================================================

router.get(
    "/:barterId/unread-count",
    appWrapper(async (req) => {

        const chatManager = new ChatManager(req.user.id);

        const unread = await chatManager.getUnreadCount(
            req.params.barterId
        );

        return {
            success: true,
            data: unread
        };

    })
);

module.exports = router;