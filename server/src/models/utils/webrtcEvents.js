module.exports = (io, socket) => {

  // =========================
  // CALL USER
  // =========================
  socket.on("call_user", ({ barterId, offer }) => {
    socket.to(barterId).emit("incoming_call", {
      offer,
      from: socket.userId
    });
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