const BaseModel = require("./libs/BaseModel");

class KeyModel extends BaseModel {
    constructor(userId) {
        super(userId);
        this.table = "user_keys";
    }

    async createUserKey({
        userId,
        publicKey,
        algorithm = "X25519"
    }) {
        const db = await this.getQueryBuilder();
        const insertData = this.insertStatement({
            user_id: userId,
            public_key: publicKey,
            algorithm
        })
        const [key] = await db(this.table).insert(insertData).returning("*");
        return key;
    }

    async getMyPublicKey() {
        const db = await this.getQueryBuilder();
        return db(this.table).where({user_id: this.userId}).first();
    }

    async updateUserKey(
        userId,
        publicKey,
        algorithm = "X25519"
    ) {
        const db = await this.getQueryBuilder();
        const [key] = await db(this.table).where({ user_id: userId }).update(
            await this.updateStatement({
                public_key: publicKey,
                algorithm,
                updated_at: db.fn.now()
            })
        )
            .returning("*");
        return key;
    }

    async upsertUserKey({
        userId,
        publicKey,
        algorithm = "X25519"
    }) {
        const db = await this.getQueryBuilder();
        const insertData = this.insertStatement({
            user_id: userId,
            public_key: publicKey,
            algorithm
        })
        const [key] = await db(this.table)
            .insert(insertData)
            .onConflict("user_id")
            .merge({
                public_key: publicKey,
                algorithm,
                updated_at: db.fn.now()
            })
            .returning("*");
        return key;
    }

    async getUserKey(userId) {
        const db = await this.getQueryBuilder();
        return db(this.table).where({user_id: userId}).first();
    }

    async deleteUserKey(userId) {
        const db = await this.getQueryBuilder();
        return db(this.table).where({user_id: userId}).del();
    }

    async getPeerPublicKey(barterId, userId) {
        const db = await this.getQueryBuilder();
        const barter = await db("barter_requests").where({id: barterId}).first();
        if (!barter) { return null; }
        const peerId = barter.requester_id === userId ? barter.receiver_id : barter.requester_id;
        return db(this.table).where({user_id: peerId}).first();
    }

    async hasKey(userId) {
        const db = await this.getQueryBuilder();
        const key = await db(this.table).where({user_id: userId}).first();
        return !!key;
    }
}
module.exports = KeyModel;