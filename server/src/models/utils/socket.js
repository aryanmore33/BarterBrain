const { Server } = require("socket.io");
const chatService = require("./chatService");
const webrtcEvents = require("./webrtcEvents");
const socketAuth = require("./socketAuth");

let io;

const ALLOWED_ORIGINS = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ALLOWED_ORIGINS,   // ✅ Must be specific — "*" blocks cookies
      credentials: true,
    },
  });

  io.use(socketAuth); // 🔐 auth middleware

  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.userId);

    // Join a private room for the user to receive direct notifications
    socket.join(`user_${socket.userId}`);

    // =========================
    // JOIN ROOM (Barter specific)
    // =========================
    socket.on("join_room", async ({ barterId }) => {
      const isAllowed = await chatService.validateBarterAccess(
        socket.userId,
        barterId
      );

      if (!isAllowed) {
        socket.emit("error", { message: "Access denied to this barter chat" });
        return;
      }

      socket.join(barterId);
      console.log(`User ${socket.userId} joined room ${barterId}`);
    });

    // =========================
    // CHAT
    // =========================
    socket.on("send_message", async ({ barterId, message }) => {
      try {
        const savedMessage = await chatService.saveMessage({
          barterId,
          senderId: socket.userId,
          message
        });

        // Broadcast to everyone ELSE in room (sender adds it optimistically)
        socket.to(barterId).emit("receive_message", savedMessage);
        // Also confirm back to sender with the DB-saved version (has real id/timestamp)
        socket.emit("message_sent", savedMessage);
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // =========================
    // WEBRTC EVENTS
    // =========================
    webrtcEvents(io, socket);

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.userId);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };