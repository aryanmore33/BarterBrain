import { socketService } from "./socket";
import { Message } from "./api";

class ChatService {
    connect() { socketService.connect(); }
    disconnect() { socketService.disconnect(); }
    joinChat(barterId: string) { socketService.joinChat(barterId) }
    leaveChat(barterId: string) { socketService.leaveChat(barterId) }

    sendMessage(data: {
        barterId: string;
        ciphertext: string;
        iv: string;
        auth_tag: string;
        message_type?: "text" | "image" | "file" | "audio" | "video";
        reply_to_message_id?: string | null;
    }) { socketService.sendMessage(data) }

    editMessage(data: {
        messageId: string;
        ciphertext: string;
        iv: string;
        auth_tag: string;
    }) { socketService.editMessage(data) }

    sendAttachment(data: {
        messageId: string;
        file_url: string;
        thumbnail_url?: string | null;
        file_name?: string | null;
        mime_type?: string | null;
        file_size?: number | null;
        width?: number | null;
        height?: number | null;
        duration?: number | null;
    }) {
        socketService.emit("send_attachment", data);
    }

    typingStart(barterId: string) { socketService.typingStart(barterId) }
    typingStop(barterId: string) { socketService.typingStop(barterId) }
    markDelivered(messageId: string) { socketService.markDelivered(messageId) }
    markRead(messageId: string) { socketService.markRead(messageId) }
    syncMessages(barterId: string, lastMessageId?: string) { socketService.emit("sync_messages", { barterId, lastMessageId }) }
    heartbeat() { socketService.heartbeat() }

    onMessage(callback: (message: Message) => void) {
        socketService.on("receive_message", callback);
    }
    onMessageAck(callback: (data: any) => void) {
        socketService.on("message_ack", callback);
    }
    onMessageEdited(callback: (message: Message) => void) {
        socketService.on("message_edited", callback);
    }
    onMessageDeleted(callback: (messageId: string) => void) {
        socketService.on("message_deleted", callback);
    }
    onAttachment(callback: (attachment: any) => void) {
        socketService.on("receive_attachment", callback);
    }
    onAttachmentSent(callback: (attachment: any) => void) {
        socketService.on("attachment_sent", callback);
    }
    onTypingStart(callback: (data: any) => void) {
        socketService.on("typing_start", callback);
    }
    onTypingStop(callback: (data: any) => void) {
        socketService.on("typing_stop", callback);
    }
    onDelivered(callback: (data: any) => void) {
        socketService.on("message_delivered", callback);
    }
    onRead(callback: (data: any) => void) {
        socketService.on("message_read", callback);
    }
    onHeartbeat(callback: (data: any) => void) {
        socketService.on("heartbeat_ack", callback);
    }
    deleteMessage(messageId: string) {
        socketService.emit("delete_message", {messageId})
    }
    off(event: string, callback?: (...args: any[]) => void) {
        socketService.off(event, callback);
    }
    on(event: string, callback: (...args: any[]) => void) {
        socketService.on(event, callback);
    }
    once(event: string, callback: (...args: any[]) => void) {
        socketService.once(event, callback);
    }
}

export const chatSocketService = new ChatService();