const CallModel = require("../models/CallModel");

class CallService {
  constructor(userId) {
    this.callModel = new CallModel(userId);
  }

  async getReceiverId(callId, userId) {

    const call = await this.callModel.findCallById(callId);

    if (!call) {
      throw new Error("Call not found");
    }

    const receiverId = await this.callModel.getOtherParticipant(
      userId,
      call.barter_request_id
    );

    return {
      call,
      receiverId
    };
  }

  async startCall({
    barterRequestId,
    initiatorId
  }) {

    const activeUserCall =
      await this.callModel.findActiveCallByUser(
        initiatorId
      );

    if (activeUserCall) {
      throw new Error("You are already in another call.");
    }

    const hasAccess =
      await this.callModel.validateBarterAccess(
        initiatorId,
        barterRequestId
      );

    if (!hasAccess) {
      throw new Error("Unauthorized");
    }

    const existing =
      await this.callModel.findActiveCallByBarter(
        barterRequestId
      );

    if (existing) {
      throw new Error("Call already active");
    }

    const call =
      await this.callModel.createCall({
        barter_request_id: barterRequestId,
        initiator_id: initiatorId,
        status: "ringing"
      });

    const receiver =
      await this.callModel.getOtherParticipant(
        initiatorId,
        barterRequestId
      );

    await Promise.all([

      this.callModel.addParticipant({
        call_id: call.id,
        user_id: initiatorId
      }),

      this.callModel.addParticipant({
        call_id: call.id,
        user_id: receiver
      }),

      this.callModel.createLog({
        call_id: call.id,
        user_id: initiatorId,
        event_type: "call_started"
      })

    ]);
    return {
      call, receiverId: receiver
    };
  }

  async isParticipant(callId, userId) {
    return this.callModel.isParticipant(callId, userId);
  }

  async acceptCall(callId, userId) {

    const call =
      await this.callModel.findCallById(callId);

    if (!call) {
      throw new Error("Call not found");
    }
    if (call.status !== "ringing") {
      throw new Error("Call is no longer available.");
    }


    await this.callModel.updateParticipant(
      userId,
      callId,
      {
        connection_successful: true
      }
    );
    const updatedCall = await this.callModel.startCall(callId);

    await this.callModel.createLog({
      call_id: callId,
      user_id: userId,
      event_type: "call_accepted"
    });

    return {
      call: updatedCall,
      callerId: updatedCall.initiator_id
    }
  }

  async rejectCall(callId, userId) {

    const call =
      await this.callModel.updateCallStatus(
        callId,
        "rejected"
      );
    await this.callModel.removeAllParticipants(callId);
    await this.callModel.createLog({
      call_id: callId,
      user_id: userId,
      event_type: "call_rejected"
    });

    return {
      call,
      callerId: call.initiator_id
    };
  }

  async missedCall(callId, userId) {

    const call =
      await this.callModel.updateCallStatus(
        callId,
        "missed"
      );

    await this.callModel.createLog({
      call_id: callId,
      user_id: userId,
      event_type: "call_missed"
    });

    const { receiverId } =
      await this.getReceiverId(callId, userId);

    return {
      call,
      receiverId
    };
  }



  async busyCall(callId, userId) {

    await this.callModel.createLog({
      call_id: callId,
      user_id: userId,
      event_type: "call_busy"
    });

    const { receiverId } =
      await this.getReceiverId(callId, userId);

    return {
      receiverId
    };
  }


  async endCall(callId, userId) {

    const call =
      await this.callModel.endCall(callId);

    await this.callModel.removeAllParticipants(callId);

    await this.callModel.createLog({
      call_id: callId,
      user_id: userId,
      event_type: "call_ended"
    });

    const { receiverId } =
      await this.getReceiverId(callId, userId);

    return {
      call,
      receiverId
    };
  }


  async leaveCall(callId, userId) {

    await this.callModel.removeParticipant(
      callId,
      userId
    );
    const participants =
      await this.callModel.getParticipants(callId);

    const activeParticipants =
      participants.filter(p => !p.left_at);

    if (activeParticipants.length === 0) {

      await this.callModel.endCall(callId);

    }
    await this.callModel.createLog({
      call_id: callId,
      user_id: userId,
      event_type: "peer_disconnected"
    });

    const { receiverId } =
      await this.getReceiverId(callId, userId);

    return {
      receiverId
    };
  }

  // =========================================================
  // ICE EVENT
  // =========================================================

  async logIceCandidate(callId, userId) {

    await this.callModel.createLog({
      call_id: callId,
      user_id: userId,
      event_type: "ice_candidate_sent"
    });
    const { receiverId } =
      await this.getReceiverId(callId, userId);

    return {
      receiverId
    };

  }

  // =========================================================
  // OFFER
  // =========================================================

  async logOffer(callId, userId) {

    await this.callModel.createLog({
      call_id: callId,
      user_id: userId,
      event_type: "offer_sent"
    });
    this.isParticipant(callId, userId);
    const { receiverId } =
      await this.getReceiverId(callId, userId);

    return {
      receiverId
    };
  }

  // =========================================================
  // ANSWER
  // =========================================================

  async logAnswer(callId, userId) {

    await this.callModel.createLog({
      call_id: callId,
      user_id: userId,
      event_type: "answer_sent"
    });
    this.isParticipant(callId, userId);
    const { receiverId } =
      await this.getReceiverId(callId, userId);

    return {
      receiverId
    };
  }


  async toggleCamera(callId, userId, enabled) {

    await this.callModel.updateParticipant(
      userId,
      callId,
      {
        camera_enabled: enabled
      }
    );

    await this.callModel.createLog({

      call_id: callId,

      user_id: userId,

      event_type: enabled
        ? "camera_enabled"
        : "camera_disabled"

    });
    this.isParticipant(callId, userId);
    const { receiverId } =
      await this.getReceiverId(callId, userId);

    return {
      receiverId
    };
  }


  async toggleMic(callId, userId, enabled) {

    await this.callModel.updateParticipant(
      userId,
      callId,
      {
        mic_enabled: enabled
      }
    );

    await this.callModel.createLog({

      call_id: callId,

      user_id: userId,

      event_type: enabled
        ? "mic_enabled"
        : "mic_disabled"

    });

    const { receiverId } =
      await this.getReceiverId(callId, userId);

    return {
      receiverId
    };
  }

  // =========================================================
  // SCREEN SHARE
  // =========================================================

  async toggleScreenShare(
    callId,
    userId,
    enabled
  ) {

    await this.callModel.updateParticipant(
      userId,
      callId,
      {
        screen_shared: enabled
      }
    );

    await this.callModel.createLog({

      call_id: callId,

      user_id: userId,

      event_type: enabled
        ? "screen_share_started"
        : "screen_share_stopped"

    });

    const { receiverId } =
      await this.getReceiverId(callId, userId);

    return {
      receiverId
    };
  }

  // =========================================================
  // GET CALL
  // =========================================================

  async getCall(callId) {

    return this.callModel.findCallById(callId);

  }

  // =========================================================
  // GET PARTICIPANTS
  // =========================================================

  async getParticipants(callId) {

    return this.callModel.getParticipants(callId);

  }

  // =========================================================
  // GET LOGS
  // =========================================================

  async getLogs(callId) {

    return this.callModel.getLogs(callId);

  }

  async validateBarterAccess(userId, barterRequestId) {
    return this.callModel.validateBarterAccess(
      userId,
      barterRequestId
    );
  }

  async getCallByBarter(barterRequestId) {
    return this.callModel.getCallByBarter(
      barterRequestId
    );
  }

}

module.exports = CallService;