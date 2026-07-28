const crypto = require("crypto");
const BaseModel = require("../models/libs/BaseModel");
const { table } = require("console");

class ChatKeyModel extends BaseModel {
    constructor(userId) {
        super(userId);
        this.table = "chat_keys"
    }
    async createChatKey({
        barterId, salt, version = 1, algorithm = "HKDF-SHA256", createdBy
    }) {
        const db = await this.getQueryBuilder();
        const [chatKey] = await db(this.table).insert(this.insertStatement({
            barter_id: barterId,
            salt, version, algorithm, created_by: createdBy
        })).returning("*");
        return chatKey;
    }
    async getChatKey(barterId) {
        const db = await this.getQueryBuilder();
        return db(this.table).where({ barter_id: barterId }).first();
    }
    async updateSalt({ barterId, salt, version }) {
        const db = await this.getQueryBuilder();
        const [chatKey] = await db(this.table).where({ barter_id: barterId }).update(
            await this.updateStatement({ salt, version, rotated_at: db.fn.now(), updated_at: db.fn.now() })
        ).returning("*");
        return chatKey;
    }
    async deleteChatKey(barterId) {
        const db = await this.getQueryBuilder();
        return db(this.table).where({ barter_id: barterId }).del();
    }
}
module.exports = ChatKeyModel;