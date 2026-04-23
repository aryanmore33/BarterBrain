const BarterModel = require("../../models/barterModel");
const SkillModel = require("../../models/skillModel");
const AppError = require("../../errorHandlers/AppError");
const { getIO } = require("../../models/utils/socket");

class BarterManager {

  // ===============================
  // CREATE REQUEST
  // ===============================
  static async createRequest(userId, {
    receiver_id,
    requester_skill_id,
    receiver_skill_id,
    message
  }) {

    if (!receiver_id || !requester_skill_id || !receiver_skill_id) {
      throw new AppError("Missing required fields", 400, "Invalid request");
    }

    if (userId === receiver_id) {
      throw new AppError("You cannot send request to yourself", 400);
    }

    const barterModel = new BarterModel(userId);
    const skillModel = new SkillModel(userId);

    // Validate skills exist
    const requesterSkill = await skillModel.findOfferedSkillById(requester_skill_id);

    if (!requesterSkill || requesterSkill.user_id !== userId) {
      throw new AppError("Invalid requester skill", 400, "Invalid requester skill");
    }

    const receiverSkill = await skillModel.findOfferedSkillById(receiver_skill_id);
    if (!receiverSkill || receiverSkill.user_id !== receiver_id) {
      throw new AppError("Receiver does not offer this skill", 400, "Receiver does not offer this skill");
    }

    // Prevent duplicate request
    const existing = await barterModel.getUserRequests(userId);
    const duplicate = existing.find(
      r =>
        r.requester_id === userId &&
        r.receiver_id === receiver_id &&
        r.requester_skill_id === requester_skill_id &&
        r.receiver_skill_id === receiver_skill_id &&
        r.status === "pending"
    );

    if (duplicate) {
      throw new AppError("Request already sent", 400);
    }

    return barterModel.createRequest({
      requester_id: userId,
      receiver_id,
      requester_skill_id,
      receiver_skill_id,
      message
    });
  }

  // ===============================
  // GET ALL REQUESTS
  // ===============================
  static async getRequests(userId) {
    const barterModel = new BarterModel(userId);

    const data = await barterModel.getUserRequests(userId);

    return {
      incoming: data.filter(r => r.receiver_id === userId),
      outgoing: data.filter(r => r.requester_id === userId)
    };
  }

  // ===============================
  // ACCEPT / REJECT
  // ===============================
  static async updateRequestStatus(userId, requestId, status) {

    if (!["accepted", "rejected", "cancelled"].includes(status)) {
      throw new AppError("Invalid status", 400);
    }

    const barterModel = new BarterModel(userId);

    const request = await barterModel.findById(requestId);

    if (!request) {
      throw new AppError("Request not found", 404);
    }

    // Only receiver can accept/reject
    if (status === "accepted" || status === "rejected") {
      if (request.receiver_id !== userId) {
        throw new AppError("Only receiver can perform this action", 403);
      }
    }

    // Only requester can cancel
    if (status === "cancelled") {
      if (request.requester_id !== userId) {
        throw new AppError("Only requester can cancel", 403);
      }
    }

    if (request.status !== "pending") {
      throw new AppError("Request already processed", 400);
    }

    const updatedRequest = await barterModel.updateStatus(requestId, status);

    // Notify users via sockets if accepted
    if (status === "accepted") {
      try {
        const io = getIO();
        // Notify requester
        io.to(`user_${updatedRequest.requester_id}`).emit("barter_accepted", {
          barterId: requestId,
          message: "Your barter request has been accepted! You can now chat and call."
        });
        // Notify receiver (the one who just accepted)
        io.to(`user_${updatedRequest.receiver_id}`).emit("barter_accepted", {
          barterId: requestId,
          message: "Barter accepted successfully."
        });
      } catch (err) {
        console.error("Failed to emit barter_accepted socket event:", err.message);
      }
    }

    return updatedRequest;
  }

  // ===============================
  // COMPLETE REQUEST
  // ===============================
  static async completeRequest(userId, requestId) {

    const barterModel = new BarterModel(userId);

    const request = await barterModel.findById(requestId);

    if (!request) {
      throw new AppError("Request not found", 404);
    }

    if (request.status !== "accepted") {
      throw new AppError("Only accepted requests can be completed", 400);
    }

    // Either user can mark complete
    if (
      request.requester_id !== userId &&
      request.receiver_id !== userId
    ) {
      throw new AppError("Unauthorized", 403);
    }

    return barterModel.markComplete(requestId);
  }
}

module.exports = BarterManager;