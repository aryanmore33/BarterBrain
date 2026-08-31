const crypto = require("crypto");
const ChatKeyModel = require("../../models/chatKeyModel");
const ChatModel = require("../../models/chatModel");
// const { use } = require("react");

class ChatKeyManager {
    constructor(userId) {
        this.userId = userId;
        this.chatKeyModel = new ChatKeyModel(userId);
        this.chatModel = new ChatModel(userId);
    }
    generateSalt() {
        return crypto.randomBytes(32).toString("base64");
    }
    async createChatKey(barterId) {
        const hasAccess = await this.chatModel.validateBarterAccess(this.userId, barterId);
        if (!hasAccess) {
            throw new Error("Unauthorized");
        }
        const existing = await this.chatKeyModel.getChatKey(barterId)
        if (existing) { return existing; }
        return this.chatKeyModel.createChatKey({
            barterId,
            salt: this.generateSalt(),
            version: 1,
            algorithm: "HKDF-SHA256",
            createdBy: this.userId
        })
    }
    async getChatKey(barterId) {
        const hasAccess = await this.chatModel.validateBarterAccess(this.userId, barterId);
        if (!hasAccess) {
            throw new Error("Unauthorized");
        }
        const chatKey = await this.chatKeyModel.getChatKey(barterId)
        if (!chatKey) {
            throw new Error("Chat key not found");
        }
        return chatKey;
    }
    async rotateChatKey(barterId) {
        const hasAccess = await this.chatModel.validateBarterAccess(this.userId, barterId);
        if (!hasAccess) {
            throw new Error("Unauthorized");
        }
        const current = await this.chatKeyModel.getChatKey(barterId);
        if (!current) {
            throw new Error("Chat key not found");
        }
        return this.chatKeyModel.updateSalt({
            barterId,
            salt: this.generateSalt(),
            version: current.version + 1
        })
    }
    async deleteChatKey(barterId) {
        const hasAccess = await this.chatModel.validateBarterAccess(this.userId, barterId);
        if (!hasAccess) {
            throw new Error("Unauthorized");
        }
        return this.chatKeyModel.deleteChatKey(barterId)
    }
}
module.exports = ChatKeyManager;