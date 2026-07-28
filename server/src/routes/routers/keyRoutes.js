const express = require("express");

const router = express.Router();

const {appWrapper} = require("../routeWrapper");

const KeyManager = require("../../businessLogic/managers/keyManager");

const handleRegisterKey = appWrapper(async (req) => {
    const keyManager = new KeyManager(req.user.id);
    const key = await keyManager.registerPublicKey({
        publicKey: req.body.publicKey,
        algorithm: req.body.algorithm || "X25519"
    });
    return {
        success: true,
        message: "Public key registered successfully",
        data: key
    };
});

router.post("/public-key", handleRegisterKey);
router.post("/register", handleRegisterKey);

router.get(
    "/public-key",
    appWrapper(async (req) => {
        const keyManager = new KeyManager(req.user.id);
        const key = await keyManager.getMyPublicKey();
        return {
            success: true,
            data: key
        };
    })
);

router.get(
    "/public-key/:userId",
    appWrapper(async (req) => {
        const keyManager = new KeyManager(req.user.id);
        const key = await keyManager.getUserPublicKey(
            req.params.userId
        );
        return {
            success: true,
            data: key
        };
    })
);

router.put(
    "/public-key",
    appWrapper(async (req) => {
        const keyManager = new KeyManager(req.user.id);
        const key = await keyManager.rotatePublicKey({
            publicKey: req.body.publicKey,
            algorithm: req.body.algorithm || "X25519"
        });
        return {
            success: true,
            message: "Public key updated successfully",
            data: key
        };
    })
);

router.get(
    "/barter/:barterId",
    appWrapper(async (req) => {
        const keyManager = new KeyManager(
            req.user.id
        );
        const key = await keyManager.getBarterPublicKey(
            req.params.barterId
        );
        return {
            success: true,
            data: key
        };
    })
);

router.get(
    "/session/:barterId",
    appWrapper(async (req) => {
        const manager = new KeyManager(
            req.user.id
        );
        const session = await manager.getSessionKey(
            req.params.barterId
        );
        return {
            success: true,
            data: session
        };
    })
);

router.get(
    "/me",
    appWrapper(async (req) => {
        const keyManager = new KeyManager(req.user.id);
        const key = await keyManager.getMyPublicKey();
        if (!key) {
            return {
                success: false,
                message: "Public key not found"
            };
        }
        return {
            success: true,
            data: {
                publicKey: key.public_key,
                algorithm: key.algorithm,
                createdAt: key.created_at,
                updatedAt: key.updated_at
            }
        };
    })
);

router.delete(
    "/public-key",
    appWrapper(async (req) => {
        const keyManager = new KeyManager(req.user.id);
        await keyManager.deleteMyPublicKey();
        return {
            success: true,
            message: "Public key deleted"
        };
    })
);

module.exports = router;