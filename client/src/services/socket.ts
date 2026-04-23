import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      withCredentials: true // 🍪 Send cookies with socket connection
    });

    this.socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(barterId: string) {
    this.socket?.emit("join_room", { barterId });
  }

  sendMessage(barterId: string, message: string) {
    this.socket?.emit("send_message", { barterId, message });
  }

  onMessage(callback: (message: any) => void) {
    this.socket?.on("receive_message", callback);
  }

  offMessage(callback: (message: any) => void) {
    this.socket?.off("receive_message", callback);
  }

  onMessageSent(callback: (message: any) => void) {
    this.socket?.on("message_sent", callback);
  }

  offMessageSent(callback: (message: any) => void) {
    this.socket?.off("message_sent", callback);
  }

  // WebRTC Signaling
  emitCall(barterId: string, offer: any) {
    this.socket?.emit("call_user", { barterId, offer });
  }

  onIncomingCall(callback: (data: { offer: any, from: string }) => void) {
    this.socket?.on("incoming_call", callback);
  }

  offIncomingCall(callback: (data: { offer: any, from: string }) => void) {
    this.socket?.off("incoming_call", callback);
  }

  emitAnswer(barterId: string, answer: any) {
    this.socket?.emit("answer_call", { barterId, answer });
  }

  onCallAccepted(callback: (data: { answer: any }) => void) {
    this.socket?.on("call_accepted", callback);
  }

  offCallAccepted(callback: (data: { answer: any }) => void) {
    this.socket?.off("call_accepted", callback);
  }

  emitIceCandidate(barterId: string, candidate: any) {
    this.socket?.emit("ice_candidate", { barterId, candidate });
  }

  onIceCandidate(callback: (data: { candidate: any }) => void) {
    this.socket?.on("ice_candidate", callback);
  }

  offIceCandidate(callback: (data: { candidate: any }) => void) {
    this.socket?.off("ice_candidate", callback);
  }

  emitEndCall(barterId: string) {
    this.socket?.emit("end_call", { barterId });
  }

  onCallEnded(callback: () => void) {
    this.socket?.on("call_ended", callback);
  }

  offCallEnded(callback: () => void) {
    this.socket?.off("call_ended", callback);
  }

  emitDeclineCall(barterId: string) {
    this.socket?.emit("decline_call", { barterId });
  }

  onCallDeclined(callback: () => void) {
    this.socket?.on("call_declined", callback);
  }

  offCallDeclined(callback: () => void) {
    this.socket?.off("call_declined", callback);
  }

  // Notifications
  onBarterAccepted(callback: (data: { barterId: string, message: string }) => void) {
    this.socket?.on("barter_accepted", callback);
  }

  onMeetingNotification(callback: (data: { barterId: string, callerName: string, type: string }) => void) {
    this.socket?.on("meeting_notification", callback);
  }

  offMeetingNotification(callback: (data: { barterId: string, callerName: string, type: string }) => void) {
    this.socket?.off("meeting_notification", callback);
  }

  onUserJoined(callback: (data: { userId: string }) => void) {
    this.socket?.on("user_joined", callback);
  }

  offUserJoined(callback: (data: { userId: string }) => void) {
    this.socket?.off("user_joined", callback);
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
