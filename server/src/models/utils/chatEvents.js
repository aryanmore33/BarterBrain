const ChatManager = require("../../businessLogic/managers/chatManager");

module.exports = (io, socket) => {

    const chatManager = new ChatManager(socket.userId);

    socket.on("join_chat", async ({ barterId }) => {
        try {
            const isAllowed = await chatManager.chatModel.validateBarterAccess(
                socket.userId,
                barterId
            );
            if (!isAllowed) {
                return socket.emit("error", { message: "Unauthorized" });
            }
            socket.join(`chat_${barterId}`);
            socket.to(`chat_${barterId}`).emit("user_joined_chat", {
                userId: socket.userId
            });
        } catch (err) {
            socket.emit("error", { message: err.message });
        }
    });

    socket.on("send_message", async (data) => {
        try {
            const result = await chatManager.sendMessage({
                barterId: data.barterId,
                ciphertext: data.ciphertext,
                iv: data.iv,
                auth_tag: data.auth_tag,
                message_type: data.message_type,
                reply_to_message_id: data.reply_to_message_id
            });
            socket.emit("message_ack", {
                tempId: data.tempId,
                message: result.message
            });
            socket.to(`chat_${data.barterId}`).emit("receive_message", result.message);
        } catch (err) {
            socket.emit("error", { message: err.message });
        }
    });

    socket.on("message_delivered", async ({ messageId }) => {
        try {
            const result = await chatManager.markDelivered(messageId);
            io.to(`user_${result.senderId}`).emit("message_delivered", {
                messageId,
                userId: socket.userId
            });
        } catch (err) {
            socket.emit("error", { message: err.message });
        }
    });

    socket.on("message_read", async ({ messageId }) => {
        try {
            const result = await chatManager.markRead(messageId);
            io.to(`user_${result.senderId}`).emit("message_read", {
                messageId,
                userId: socket.userId
            });
        } catch (err) {
            socket.emit("error", { message: err.message });
        }
    });

    socket.on("typing_start", async ({ barterId }) => {
        try {
            const result = await chatManager.setTyping(barterId, true);
            io.to(`user_${result.receiverId}`).emit("typing_start", {
                barterId,
                userId: socket.userId
            });
        } catch (err) {
            socket.emit("error", { message: err.message });
        }
    });

    socket.on("typing_stop", async ({ barterId }) => {
        try {
            const result = await chatManager.setTyping(barterId, false);
            io.to(`user_${result.receiverId}`).emit("typing_stop", {
                barterId,
                userId: socket.userId
            });
        } catch (err) {
            socket.emit("error", { message: err.message });
        }
    });

    socket.on("edit_message", async ({
        messageId,
        ciphertext,
        iv,
        auth_tag
    }) => {
        try {
            const result = await chatManager.editMessage({
                messageId,
                ciphertext,
                iv,
                auth_tag
            });
            socket.emit("message_edited", result.message);
            io.to(`user_${result.receiverId}`).emit("message_edited", result.message);
        } catch (err) {
            socket.emit("error", { message: err.message });
        }
    });

    socket.on("delete_message", async ({ messageId }) => {
        try {
            const result = await chatManager.deleteMessage(messageId);
            socket.emit("message_deleted", result.message);

            io.to(`user_${result.receiverId}`).emit("message_deleted", result.message);

        } catch (err) {
            socket.emit("error", { message: err.message });
        }
    });

    socket.on("send_attachment", async ({
        messageId,
        file_url,
        thumbnail_url,
        file_name,
        mime_type,
        file_size,
        width,
        height,
        duration
    }) => {
        try {
            const result = await chatManager.sendAttachment({
                messageId,
                file_url,
                thumbnail_url,
                file_name,
                mime_type,
                file_size,
                width,
                height,
                duration
            });

            socket.emit("attachment_sent", result.attachment);

            io.to(`user_${result.receiverId}`).emit("receive_attachment", result.attachment);

        } catch (err) {
            socket.emit("error", { message: err.message });
        }
    });

    socket.on("leave_chat", ({ barterId }) => {
        socket.leave(`chat_${barterId}`);

        socket.to(`chat_${barterId}`).emit("user_left_chat", {
            userId: socket.userId
        });
    });

    socket.on("online", async () => {
        try {
            await chatManager.setOnline(socket.id);

            socket.broadcast.emit("user_online", {
                userId: socket.userId
            });

        } catch (err) {
            socket.emit("error", { message: err.message });
        }
    });

    socket.on("disconnect", async () => {
        try {
            await chatManager.setOffline();

            socket.broadcast.emit("user_offline", {
                userId: socket.userId
            });

        } catch (err) {
            console.error(err);
        }
    });

    socket.on("sync_messages", async ({
        barterId,
        lastMessageId
    }) => {
        try {
            const messages = await chatManager.syncMessages({
                barterId,
                lastMessageId
            });
            socket.emit("sync_messages", messages);
        } catch (err) {
            socket.emit("error", {
                message: err.message
            });
        }
    });

    socket.on("heartbeat", () => {
        socket.emit("heartbeat_ack", {
            timestamp: Date.now()
        });
    });

};