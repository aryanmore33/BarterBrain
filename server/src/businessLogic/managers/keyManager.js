const KeyModel = require("../../models/keyModel");
const ChatModel = require("../../models/chatModel");
const ChatKeyModel = require("../../models/chatKeyModel");

class KeyManager {
    constructor(userId) {
        this.userId = userId;
        this.keyModel = new KeyModel(userId);
        this.chatModel = new ChatModel(userId);
        this.chatKeyModel = new ChatKeyModel(userId);
    }

    async registerPublicKey({
        publicKey,
        algorithm = "X25519"
    }) {
        if (!publicKey) {
            throw new Error("Public key is required");
        }
        return this.keyModel.upsertUserKey({
            userId : this.userId,
            publicKey,
            algorithm
        });
    }

    async getMyPublicKey() {
        const key = await this.keyModel.getUserKey(this.userId);
        if (!key) {
            throw new Error("Public key not found");
        }
        return key;
    }

    async getUserPublicKey(userId) {
        const key = await this.keyModel.getUserKey(userId);
        if (!key) {
            throw new Error("Public key not found");
        } return key;
    }

    async hasPublicKey(userId = this.userId) {
        return this.keyModel.hasKey(userId);
    }

    async rotatePublicKey({
        publicKey,
        algorithm = "X25519"
    }) {
        if (!publicKey) {
            throw new Error("Public key is required");
        }
        return this.keyModel.updateUserKey(
            this.userId,
            publicKey,
            algorithm
        )
    }

    async deleteMyPublicKey() {
        return this.keyModel.deleteUserKey(this.userId);
    }

    async getBarterPublicKey(barterId) {
        const hasAccess = await this.chatModel.validateBarterAccess(
            this.userId,
            barterId
        );
        if (!hasAccess) {
            throw new Error("Unauthorized");
        }
        const otherUserId = await this.chatModel.getOtherParticipant(
            this.userId,
            barterId
        );
        if (!otherUserId) {
            throw new Error("Other participant not found");
        }
        const key = await this.keyModel.getUserKey(otherUserId)
        if (!key) {
            throw new Error("Public key not found");
        }
        return {
            userId: otherUserId,
            publicKey: key.public_key,
            algorithm: key.algorithm
        };
    }
    async getSessionKey(barterId) {
        const hasAccess = await this.chatModel.validateBarterAccess(
            this.userId,
            barterId
        );
        if (!hasAccess) {
            throw new Error("Unauthorized");
        }
        const peerPublicKey = await this.keyModel.getPeerPublicKey(barterId, this.userId)
        if (!peerPublicKey) {
            throw new Error("Peer public key not found");
        }
        const chatKey = await this.chatKeyModel.getChatKey(barterId)
        if (!chatKey) {
            throw new Error("Chat key not found");
        }
        return{
            publicKey: peerPublicKey.public_key,
            algorithm: peerPublicKey.algorithm,
            salt: chatKey.salt,
            version: chatKey.version
        }
    }
}
module.exports = KeyManager;