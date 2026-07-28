import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on("connect", () => {
      console.log("Connected to socket server", this.socket?.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from socket server", reason);
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  once(event: string, callback: (data: any) => void) {
    this.socket?.once(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    if (callback) this.socket?.off(event, callback);
    else this.socket?.off(event);
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  joinChat(barterId: string) {
    this.socket?.emit("join_chat", { barterId });
  }

  joinRoom(barterId: string) {
    this.joinChat(barterId);
  }

  leaveChat(barterId: string) {
    this.emit("leave_chat", { barterId });
  }

  sendMessage(payload: {
    barterId: string;
    ciphertext: string;
    iv: string;
    auth_tag: string;
    message_type?: "text" | "image" | "file" | "audio" | "video";
    reply_to_message_id?: string | null;
    tempId?: string;
  }) {
    this.socket?.emit("send_message", payload);
  }

  sendAttachment(payload: {
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
    this.emit("send_attachment", payload);
  }

  editMessage(payload: {
    messageId: string;
    ciphertext: string;
    iv: string;
    auth_tag: string;
  }) {
    this.emit("edit_message", payload);
  }

  deleteMessage(messageId: string) {
    this.emit("delete_message", { messageId });
  }

  typingStart(barterId: string) {
    this.emit("typing_start", { barterId });
  }
  typingStop(barterId: string) {
    this.emit("typing_stop", { barterId });
  }

  markDelivered(messageId: string) {
    this.emit("message_delivered", { messageId });
  }
  markRead(messageId: string) {
    this.emit("message_read", { messageId });
  }

  ackMessage(messageId: string) {
    this.emit("ack_message", { messageId });
  }
  syncMessages(barterId: string, lastMessageId?: string) {
    this.emit("sync_messages", { barterId, lastMessageId });
  }
  heartbeat() {
    this.emit("heartbeat");
  }

  startCall(barterRequestId: string, ack?: (res: any) => void) {
    this.socket?.emit("call-user", { barterRequestId }, ack);
  }
  acceptCall(callId: string, ack?: (res: any) => void) {
    this.socket?.emit("accept-call", { callId }, ack);
  }
  rejectCall(callId: string, ack?: (res: any) => void) {
    this.socket?.emit("reject-call", { callId }, ack);
  }
  endCall(callId: string, ack?: (res: any) => void) {
    this.socket?.emit("end_call", { callId }, ack);
  }
  leaveCall(callId: string, ack?: (res: any) => void) {
    this.socket?.emit("leave_call", { callId }, ack);
  }

  sendOffer(callId: string, offer: RTCSessionDescriptionInit, ack?: (res: any) => void) {
    this.socket?.emit("offer", { callId, offer }, ack);
  }
  sendAnswer(callId: string, answer: RTCSessionDescriptionInit, ack?: (res: any) => void) {
    this.socket?.emit("answer", { callId, answer }, ack);
  }
  sendIceCandidate(callId: string, candidate: RTCIceCandidateInit, ack?: (res: any) => void) {
    this.socket?.emit("ice_candidate", { callId, candidate }, ack);
  }

  toggleCamera(callId: string, enabled: boolean) {
    this.emit("toggle_camera", { callId, enabled });
  }
  toggleMic(callId: string, enabled: boolean) {
    this.emit("toggle_mic", { callId, enabled });
  }
  toggleScreenShare(callId: string, enabled: boolean) {
    this.emit("toggle_screen_share", { callId, enabled });
  }

  onIncomingCall(callback: (data: any) => void) {
    this.socket?.on("incomingcall", callback);
  }
  offIncomingCall(callback: (data: any) => void) {
    this.socket?.off("incomingcall", callback);
  }

  onCallAccepted(callback: (data: any) => void) {
    this.socket?.on("callAccepted", callback);
  }
  offCallAccepted(callback: (data: any) => void) {
    this.socket?.off("callAccepted", callback);
  }

  onCallRejected(callback: (data: any) => void) {
    this.socket?.on("callRejected", callback);
  }
  offCallRejected(callback: (data: any) => void) {
    this.socket?.off("callRejected", callback);
  }

  onIceCandidate(callback: (data: any) => void) {
    this.socket?.on("iceCandidate", callback);
  }
  offIceCandidate(callback: (data: any) => void) {
    this.socket?.off("iceCandidate", callback);
  }

  onOffer(callback: (data: any) => void) {
    this.socket?.on("offer", callback);
  }
  offOffer(callback: (data: any) => void) {
    this.socket?.off("offer", callback);
  }

  onAnswer(callback: (data: any) => void) {
    this.socket?.on("answer", callback);
  }
  offAnswer(callback: (data: any) => void) {
    this.socket?.off("answer", callback);
  }

  onCallEnded(callback: (data: any) => void) {
    this.socket?.on("endCall", callback);
  }
  offCallEnded(callback: (data: any) => void) {
    this.socket?.off("endCall", callback);
  }

  onUserLeft(callback: (data: any) => void) {
    this.socket?.on("userLeft", callback);
  }
  offUserLeft(callback: (data: any) => void) {
    this.socket?.off("userLeft", callback);
  }

  onUserJoined(callback: (data: any) => void) {
    this.socket?.on("user_joined_chat", callback);
  }
  offUserJoined(callback: (data: any) => void) {
    this.socket?.off("user_joined_chat", callback);
  }

  onMessage(callback: (data: any) => void) {
    this.socket?.on("receive_message", callback);
  }
  offMessage(callback: (data: any) => void) {
    this.socket?.off("receive_message", callback);
  }

  onMessageSent(callback: (data: any) => void) {
    this.socket?.on("message_ack", callback);
  }
  offMessageSent(callback: (data: any) => void) {
    this.socket?.off("message_ack", callback);
  }

  onMeetingNotification(callback: (data: any) => void) {
    this.socket?.on("meeting_notification", callback);
  }
  offMeetingNotification(callback: (data: any) => void) {
    this.socket?.off("meeting_notification", callback);
  }
}

export const socketService = new SocketService();
