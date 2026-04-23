const Db = require("../libs/Db");

const db = Db.getQueryBuilder();

const chatService = {

  // =========================
  // CHECK ACCESS
  // =========================
  async validateBarterAccess(userId, barterId) {
    const barter = await db("barter_requests")
      .where({ id: barterId })
      .first();

    if (!barter) return false;

    if (barter.status !== "accepted") return false;

    return (
      barter.requester_id === userId ||
      barter.receiver_id === userId
    );
  },

  // =========================
  // SAVE MESSAGE
  // =========================
  async saveMessage({ barterId, senderId, message }) {

    const [data] = await db("messages")
      .insert({
        barter_id: barterId,
        sender_id: senderId,
        message
      })
      .returning("*");

    return data;
  },

  // =========================
  // GET CHAT HISTORY (optional API)
  // =========================
  async getMessages(barterId) {
    return db("messages")
      .where({ barter_id: barterId })
      .orderBy("created_at", "asc");
  }
};

module.exports = chatService;