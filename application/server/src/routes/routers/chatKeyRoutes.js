const express = require("express");

const router = express.Router();

const {appWrapper} = require("../routeWrapper");

const ChatKeyManager = require("../../businessLogic/managers/chatKeyManager");

router.post(
    "/:barterId",
    appWrapper(async (req) => {

        const manager = new ChatKeyManager(req.user.id);

        const chatKey = await manager.createChatKey(
            req.params.barterId
        );

        return {

            message: "Chat key created successfully",

            data: chatKey

        };

    })
);

router.get(
    "/:barterId",
    appWrapper(async (req) => {

        const manager = new ChatKeyManager(req.user.id);

        const chatKey = await manager.getChatKey(
            req.params.barterId
        );

        return {

            data: {

                barterId: chatKey.barter_id,

                salt: chatKey.salt,

                version: chatKey.version,

                algorithm: chatKey.algorithm

            }

        };

    })
);

router.put(
    "/:barterId/rotate",
    appWrapper(async (req) => {

        const manager = new ChatKeyManager(req.user.id);

        const chatKey = await manager.rotateChatKey(
            req.params.barterId
        );

        return {

            message: "Chat key rotated successfully",

            data: chatKey

        };

    })
);

router.delete(
    "/:barterId",
    appWrapper(async (req) => {

        const manager = new ChatKeyManager(req.user.id);

        await manager.deleteChatKey(
            req.params.barterId
        );

        return {

            message: "Chat key deleted successfully"

        };

    })
);

module.exports = router;