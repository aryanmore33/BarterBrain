// const { error } = require("winston");
const ChatModel = require("../../models/chatModel")

class ChatManager {
  constructor(userId) {
    this.userId = userId;
    this.chatModel = new ChatModel(userId);
  }

  async sendMessage({
    barterId,
    ciphertext,
    iv,
    auth_tag,
    message_type = "text",
    reply_to_message_id = null
  }) {
    const hasAccess = await this.chatModel.validateBarterAccess(this.userId, barterId)
    if (!hasAccess) {
      throw new Error("unauthorized");
    }
    if (reply_to_message_id) {
      const reply = await this.chatModel.findMessageById(reply_to_message_id);
      if (!reply) {
        throw new Error("Reply message not found");
      }
      if (reply.barter_id != barterId) {
        throw new Error("Invalid reply message");
      }
    }
    const message = await this.chatModel.createMessage({
      barterId,
      senderId: this.userId,
      ciphertext,
      iv,
      auth_tag,
      message_type,
      reply_to_message_id
    })
    const receiverId = await this.chatModel.getOtherParticipant(this.userId, barterId);
    return { message, receiverId }
  }

  async getMessage(messageId) {
    const message = await this.chatModel.findMessageById(messageId)
    if (!message) {
      throw new Error("Message not found");
    }
    const hasAccess = await this.chatModel.validateBarterAccess(this.userId, message.barter_id)
    if (!hasAccess) {
      throw new Error("unauthorized");
    }
    return message;
  }

  async getMessages({
    barterId,
    limit = 50,
    offset = 0
  }) {

    const hasAccess = await this.chatModel.validateBarterAccess(this.userId, barterId)
    if (!hasAccess) {
      throw new Error("unauthorized");
    }
    return this.chatModel.getMessages(
      barterId,
      limit,
      offset
    );
  }

  async editMessage({
    messageId,
    ciphertext,
    iv,
    auth_tag
  }) {
    const message = await this.chatModel.findMessageById(messageId)
    if (!message) {
      throw new Error("Message not found");
    }
    if (message.sender_id !== this.userId) {
      throw new Error("Unauthorized");
    }
    if (message.deleted_for_everyone === true) {
      throw new Error("Message already deleted");
    }
    const updated = await this.chatModel.editMessage(messageId, this.userId, {
      ciphertext,
      iv,
      auth_tag
    })
    const receiverId = await this.chatModel.getOtherParticipant(this.userId, updated.barter_id);
    return {
      message: updated,
      receiverId
    }
  }

  async deleteMessage(messageId) {
    const message = await this.chatModel.findMessageById(messageId)
    if (!message) {
      throw new Error("Message not found");
    }
    if (message.sender_id !== this.userId) {
      throw new Error("Unauthorized");
    }
    const deleted = await this.chatModel.deleteForEveryone(messageId, this.userId);
    const receiverId = await this.chatModel.getOtherParticipant(this.userId, message.barter_id);
    return {
      message: deleted,
      receiverId
    };
  }

  async sendAttachment({
    messageId,
    file_url,
    thumbnail_url = null,
    file_name = null,
    mime_type = null,
    file_size = null,
    width = null,
    height = null, duration = null
  }) {
    const message = await this.chatModel.findMessageById(messageId)
    if (!message) {
      throw new Error("Message not found");
    }
    if (message.sender_id !== this.userId) {
      throw new Error("Unauthorized");
    }
    const attachment = await this.chatModel.addAttachment({
      message_id: messageId,
      file_url,
      thumbnail_url,
      file_name,
      mime_type,
      file_size,
      width,
      height,
      duration
    })
    const receiverId = await this.chatModel.getOtherParticipant(this.userId, message.barter_id);
    return {
      attachment,
      receiverId
    };
  }

  async markDelivered(messageId) {
    const message = await this.chatModel.findMessageById(messageId)
    if (!message) {
      throw new Error("Message not found");
    }
    const hasAccess = await this.chatModel.validateBarterAccess(this.userId, message.barter_id)
    if (!hasAccess) {
      throw new Error("unauthorized");
    }
    if (message.sender_id === this.userId) {
      throw new Error("Invalid operation");
    }
    const receipt = await this.chatModel.markDelivered(messageId, this.userId);
    const senderId = message.sender_id;
    return { receipt, senderId };
  }

  async markRead(messageId) {
    const message = await this.chatModel.findMessageById(messageId)
    if (!message) {
      throw new Error("Message not found");
    }
    const hasAccess = await this.chatModel.validateBarterAccess(this.userId, message.barter_id)
    if (!hasAccess) {
      throw new Error("unauthorized");
    }
    if (message.sender_id === this.userId) {
      throw new Error("Invalid operation");
    }
    const receipt = await this.chatModel.markRead(messageId, this.userId);
    const senderId = message.sender_id;
    return { receipt, senderId };
  }

  async setOnline(socketId) {
    return this.chatModel.setOnline(
      this.userId,
      socketId
    );
  }

  async setOffline() {
    return this.chatModel.setOffline(
      this.userId
    );
  }
  async setTyping(barterId, typing) {
    const hasAccess = await this.chatModel.validateBarterAccess(this.userId, barterId)
    if (!hasAccess) {
      throw new Error("unauthorized");
    }
    const presence = await this.chatModel.setTyping(this.userId, barterId, typing)
    const receiverId = await this.chatModel.getOtherParticipant(this.userId, barterId);
    return {
      presence,
      receiverId
    };
  }
  async getPresence(userId) {
    return this.chatModel.getPresence(userId);
  }

  async getUnreadCount(barterId) {
    const hasAccess = await this.chatModel.validateBarterAccess(this.userId, barterId)
    if (!hasAccess) {
      throw new Error("unauthorized");
    }
    return this.chatModel.getUnreadCount(this.userId, barterId);
  }

  async getReceipts(messageId) {
    const message = await this.chatModel.findMessageById(messageId)
    if (!message) {
      throw new Error("Message not found");
    }
    const hasAccess = await this.chatModel.validateBarterAccess(this.userId, message.barter_id)
    if (!hasAccess) {
      throw new Error("unauthorized");
    }
    return this.chatModel.getReceipts(messageId);
  }

  async syncMessages({ barterId, lastMessageId }) {
    const hasAccess = await this.chatModel.validateBarterAccess(this.userId, barterId)
    if (!hasAccess) {
      throw new Error("unauthorized");
    }
    return this.chatModel.getMessagesAfter(
      barterId,
      lastMessageId
    );
  }

}
module.exports = ChatManager;