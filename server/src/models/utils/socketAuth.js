const jwt = require("jsonwebtoken");
const cookie = require("cookie");

module.exports = (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token =
      cookies.token ||
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || process.env.JWT_SECRET);
    socket.userId = decoded.user_id;
    socket.user = decoded;
    
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
};