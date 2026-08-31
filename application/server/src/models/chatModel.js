const BaseModel = require("./libs/BaseModel");
// const Db = require("../../models/libs/Db");  

class ChatModel extends BaseModel {
    constructor(userId) {
        super(userId);
        this.messagesTable = "messages";
        this.receiptsTable = "message_receipts";
        this.attachmentsTable = "message_attachments";
        this.presenceTable = "user_presence";
        this.usersTable = "users";
        this.barterTable = "barter_requests";
    }

    async validateBarterAccess(userId, barterId) {
        const db = await this.getQueryBuilder();
        const barter = await db(this.barterTable)
            .where(this.whereStatement({ id: barterId }))
            .first();
        if (!barter) {
            return false;
        }
        if (barter.status !== "accepted") {
            return false;
        }
        return barter.requester_id === userId || barter.receiver_id === userId;
    }

    async getOtherParticipant(userId, barterId) {
        const db = await this.getQueryBuilder();
        const barter = await db(this.barterTable)
            .where(this.whereStatement({ id: barterId }))
            .first();

        if (!barter) {
            return null;
        }
        return barter.requester_id === userId ? barter.receiver_id : barter.requester_id;
    }

    async createMessage({ barterId, senderId, ciphertext, iv, auth_tag, message_type = "text", reply_to_message_id = null }) {
        const db = await this.getQueryBuilder();
        const insertData = this.insertStatement({
            barter_id: barterId,
            sender_id: senderId,
            ciphertext,
            iv,
            auth_tag,
            message_type,
            reply_to_message_id,
            status: "sent",
            edited: false,
            deleted_for_everyone: false,
            edited_at: null,
        });
        const [message] = await db(this.messagesTable)
            .insert(insertData)
            .returning("*");

        await db(this.receiptsTable)
            .insert(this.insertStatement({
                message_id: message.id,
                user_id: senderId,
                status: "read",
                delivered_at: db.fn.now(),
                read_at: db.fn.now()
            }));

        const receiverId = await this.getOtherParticipant(senderId, barterId);
        if (receiverId) {
            await db(this.receiptsTable)
                .insert(this.insertStatement({
                    message_id: message.id,
                    user_id: receiverId,
                    status: "sent",
                    delivered_at: null,
                    read_at: null
                }));
        }
        return message;
    }

    // getMessages() implementation has an N+1 query pattern (it runs extra queries for every message)
    async findMessageById(messageId) {
        const db = await this.getQueryBuilder();
        const message = await db(`${this.messagesTable} as m`)
            .leftJoin(`${this.usersTable} as u`, "u.id", "m.sender_id")
            .where("m.id", messageId)
            .select(
                "m.*",
                "u.name as sender_name",
                "u.profile_pic as sender_profile_pic"
            )
            .first();

        if (!message) {
            return null;
        }
        const [attachments, receipts] = await Promise.all([
            db(this.attachmentsTable)
                .where({ message_id: message.id })
                .orderBy("created_at", "asc"),
            db(`${this.receiptsTable} as mr`)
                .join(`${this.usersTable} as u`, "u.id", "mr.user_id")
                .where("mr.message_id", message.id)
                .select(
                    "mr.*",
                    "u.name",
                    "u.profile_pic"
                )
        ])
        let replyMessage = null;
        if (message.reply_to_message_id) {
            replyMessage = await db(`${this.messagesTable} as m`)
                .leftJoin(`${this.usersTable} as u`, "u.id", "m.sender_id")
                .where("m.id", message.reply_to_message_id)
                .select(
                    "m.id",
                    "m.ciphertext",
                    "m.iv",
                    "m.auth_tag",
                    "m.message_type",
                    "m.deleted_at",
                    "u.name as sender_name"
                )
                .first();
        }
        return {
            ...message,
            attachments,
            receipts,
            reply_message: replyMessage
        }
    }

    async getMessages(barterId, limit = 50, offset = 0) {
        const db = await this.getQueryBuilder();
        const messages = await db(`${this.messagesTable} as m`)
            .leftJoin(`${this.usersTable} as u`, "u.id", "m.sender_id")
            .where("m.barter_id", barterId)
            .orderBy("m.created_at", "asc")
            .limit(limit)
            .offset(offset)
            .select(
                "m.*",
                "u.name as sender_name",
                "u.profile_pic as sender_profile_pic"
            )
        if(!messages.length){ return[]; }
        const messageIds = messages.map(m => m.id);
        const replyIds = messages.filter(m => m.reply_to_message_id).map(m => m.reply_to_message_id);
        const attachments = await db(this.attachmentsTable).whereIn("message_id", messageIds).orderBy("created_at", "asc");
        const receipts = await db(`${this.receiptsTable} as mr`).join(
            `${this.usersTable} as u`, "u.id", "mr.user_id"
        ).whereIn("mr.message_id", messageIds).select("mr.*", "u.name", "u.profile_pic");
        let replyMessages = [];
        if (replyIds.length) {
            replyMessages = await db(`${this.messagesTable} as m`)
            .leftJoin(`${this.usersTable} as u`, "u.id", "m.sender_id")
            .whereIn("m.id", replyIds)
            .select(
                "m.id",
                "m.ciphertext",
                "m.iv",
                "m.auth_tag",
                "m.message_type",
                "m.deleted_at",
                "u.name as sender_name"
            )
        }
        const attachmentMap = {};
        attachments.forEach(a => {
            if (!attachmentMap[a.message_id]) {
                attachmentMap[a.message_id] = [];
            }
            attachmentMap[a.message_id].push(a);
        })
        const receiptMap = {};
        receipts.forEach(r => {
            if (!receiptMap[r.message_id]) { receiptMap[r.message_id] = []; }
            receiptMap[r.message_id].push(r);
        })
        const replyMap = {};
        replyMessages.forEach(r => { replyMap[r.id] = r; })
        return messages.map(message => ({
            ...message,
            attachments: attachmentMap[message.id] || [],
            receipts: receiptMap[message.id] || [],
            reply_message: message.reply_to_message_id ? replyMap[message.reply_to_message_id] || null : null
        }))
    }

        // return Promise.all(
        //     message.map(async (message) => {
        //         const [attachments, receipts] = await Promise.all([
        //             db(this.attachmentsTable)
        //                 .where({ message_id: message.id })
        //                 .orderBy("created_at", "asc"),
        //             db(`${this.receiptsTable} as mr`)
        //                 .join(`${this.usersTable} as u`, "u.id", "mr.user_id")
        //                 .where({ "mr.message_id": message.id })
        //                 .select(
        //                     "mr.*",
        //                     "u.name",
        //                     "u.profile_pic"
        //                 )
        //         ])
        //         let replyMessage = null;
        //         if (message.reply_to_message_id) {
        //             replyMessage = await db(`${this.messagesTable} as m`)
        //                 .leftJoin(`${this.usersTable} as u`, "u.id", "m.sender_id")
        //                 .where("m.id", message.reply_to_message_id)
        //                 .select(
        //                     "m.id",
        //                     "m.ciphertext",
        //                     "m.iv",
        //                     "m.auth_tag",
        //                     "m.message_type",
        //                     "m.deleted_at",
        //                     "u.name as sender_name"
        //                 )
        //                 .first();
        //         }
        //         return {
        //             ...message,
        //             attachments,
        //             receipts,
        //             reply_message: replyMessage
        //         }
        //     })
        // )
    // }

    async updateMessageStatus(messageId, status) {  
        const db = await this.getQueryBuilder();
        const [message] = await db(this.messagesTable)
            .where({ id: messageId })
            .update(await this.updateStatement({ status, updated_at: db.fn.now() }))
            .returning("*");
        return message;
    }

    async editMessage(messageId, senderId, payload) {
        const db = await this.getQueryBuilder();
        const [message] = await db(this.messagesTable)
            .where({
                id: messageId,
                sender_id: senderId
            })
            .where('deleted_for_everyone', false)
            .update(await this.updateStatement({
                ...payload,
                edited: true,
                edited_at: db.fn.now(),
                updated_at: db.fn.now()
            }))
            .returning("*");

        return message;
    }

    async deleteForEveryone(messageId, senderId) {
        const db = await this.getQueryBuilder();
        const [message] = await db(this.messagesTable)
            .where({
                id: messageId,
                sender_id: senderId
            })
            .where('deleted_for_everyone', false)
            .update(await this.updateStatement({
                ciphertext: null,
                iv: null,
                auth_tag: null,
                reply_to_message_id: null,
                deleted_for_everyone: true,
                updated_at: db.fn.now()
            }))
            .returning("*");

        return message;
    }

    async addAttachment({
        message_id,
        file_url,
        thumbnail_url = null,
        file_name = null,
        mime_type = null,
        file_size = null,
        width = null,
        height = null,
        duration = null
    }) {
        const db = await this.getQueryBuilder();
        const insertData = this.insertStatement({
            message_id,
            file_url,
            thumbnail_url,
            file_name,
            mime_type,
            file_size,
            width,
            height,
            duration
        })
        const [attachment] = await db(this.attachmentsTable)
            .insert(insertData)
            .returning("*");

        return attachment;
    }

    async getAttachments(messageId) {
        const db = await this.getQueryBuilder();
        return db(this.attachmentsTable)
            .where({ message_id: messageId })
            .orderBy("created_at", "asc");
    }

    async createReceipt({
        message_id,
        user_id,
        status = "sent"
    }) {
        const db = await this.getQueryBuilder();
        const insertData = this.insertStatement({
            message_id,
            user_id,
            status,
            delivered_at: status === "delivered" || status === "read" ? db.fn.now() : null,
            read_at: status === "read" ? db.fn.now() : null
        })
        const [receipt] = await db(this.receiptsTable)
            .insert(insertData)
            .onConflict(["message_id", "user_id"])
            .ignore()
            .returning("*");

        return receipt;
    }

    async markDelivered(messageId, userId) {
        const db = await this.getQueryBuilder();
        const [receipt] = await db(this.receiptsTable)
            .where({ message_id: messageId, user_id: userId, status: "sent" })
            .update({
                status: "delivered",
                delivered_at : db.fn.now()
            })
            .returning("*");

        return receipt;
    }

    async markRead(messageId, userId) {
        const db = await this.getQueryBuilder();
        const [receipt] = await db(this.receiptsTable)
            .where({ message_id: messageId, user_id: userId })
            .update({
                status: "read",
                delivered_at : db.fn.now(),
                read_at : db.fn.now()
            })
            .returning("*");

        return receipt;
    }

    async getReceipts(messageId) {
        const db = await this.getQueryBuilder();
        return db(`${this.receiptsTable} as mr`)
            .join(`${this.usersTable} as u`, "u.id", "mr.user_id")
            .where("mr.message_id", messageId)
            .select(
                "mr.*",
                "u.name",
                "u.profile_pic"
            )
            .orderBy("mr.created_at", "asc");
    }

    async setOnline(userId) {
        const db = await this.getQueryBuilder();
        const insertData = this.insertStatement({
            user_id: userId,
            online: true,
            typing_in_barter: null,
            last_seen : db.fn.now()
        })
        const [presence] = await db(this.presenceTable)
            .insert(insertData)
            .onConflict(["user_id"])
            .merge({
                online: true,
                last_seen: db.fn.now()
            })
            .returning("*");

        return presence;
    }

    async setOffline(userId) {
        const db = await this.getQueryBuilder();

        const [presence] = await db(this.presenceTable)
            .where({ user_id: userId })
            .update({
                online: false,
                typing_in_barter: null,
                last_seen: db.fn.now()
            })
            .returning("*");

        return presence;
    }

    async setTyping(userId, barterId, typing) {
        const db = await this.getQueryBuilder();
        const [presence] = await db(this.presenceTable)
            .where({ user_id: userId })
            .update({
                typing_in_barter: typing ? barterId : null,
                updated_at: db.fn.now()
            })
            .returning("*");

        return presence;
    }

    async getPresence(userId) {
        const db = await this.getQueryBuilder();
        return db(this.presenceTable)
            .where({ user_id: userId })
            .first();
    }

    async getUnreadCount(userId, barterId) {
        const db = await this.getQueryBuilder();
        const result = await db(`${this.receiptsTable} as mr`)
            .join(`${this.messagesTable} as m`, "m.id", "mr.message_id")
            .where("mr.user_id", userId)
            .where("m.barter_id", barterId)
            .whereNot("m.sender_id", userId)
            .where("mr.status", "<>", "read")
            .count("mr.id as total")
            .first();

        return Number(result.total);
    }

    async getChatSummary(barterId) {

        const db = await this.getQueryBuilder();

        const lastMessage = await db(this.messagesTable)
            .where({
                barter_id: barterId
            })
            .orderBy("created_at", "desc")
            .first();

        const totalMessages = await db(this.messagesTable)
            .where({
                barter_id: barterId
            })
            .count("id as total")
            .first();

        return {
            last_message: lastMessage,
            total_messages: Number(totalMessages.total)
        };
    }
    
    async isMessageOwner(messageId, userId) {
        const db = await this.getQueryBuilder();
        const message = await db(this.messagesTable)
            .where({
                id: messageId,
                sender_id: userId
            })
            .first();
        return !!message;

    }

    async getMessagesAfter (barterId, lastMessageId){
        const db=await this.getQueryBuilder();
        let query = db(this.messagesTable).where({
            barter_id:barterId,
            deleted_for_everyone : false
        })
        if(lastMessageId){
            const lastMessage = await this.findMessageById(lastMessageId);
            if(lastMessage){
                query = query.where("created_at", ">", lastMessage.created_at);
            }
        }
        return query.orderBy("created_at","asc");
    }
}

module.exports = ChatModel;
