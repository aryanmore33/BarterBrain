module.exports = (io, socket) => {

  // =========================
  // CALL USER
  // =========================
  socket.on("call_user", async ({ barterId, offer }) => {
    // Standard WebRTC signaling to the room
    socket.to(barterId).emit("incoming_call", {
      offer,
      from: socket.userId
    });

    // Send a notification to the other user's private room
    const chatService = require("./chatService");
    const otherUserId = await chatService.getOtherParticipant(socket.userId, barterId);
    
    if (otherUserId) {
      // Get caller name
      const Db = require("../libs/Db");
      const db = Db.getQueryBuilder();
      const user = await db("users").where({ id: socket.userId }).first();
      
      io.to(`user_${otherUserId}`).emit("meeting_notification", {
        barterId,
        callerName: user ? user.name : "Your partner",
        type: "incoming_call"
      });
    }
  });

  // =========================
  // ANSWER CALL
  // =========================
  socket.on("answer_call", ({ barterId, answer }) => {
    socket.to(barterId).emit("call_accepted", {
      answer
    });
  });

  // =========================
  // DECLINE CALL
  // =========================
  socket.on("decline_call", ({ barterId }) => {
    socket.to(barterId).emit("call_declined");
  });

  // =========================
  // ICE CANDIDATE
  // =========================
  socket.on("ice_candidate", ({ barterId, candidate }) => {
    socket.to(barterId).emit("ice_candidate", {
      candidate
    });
  });

  // =========================
  // END CALL
  // =========================
  socket.on("end_call", ({ barterId }) => {
    socket.to(barterId).emit("call_ended");
  });

};