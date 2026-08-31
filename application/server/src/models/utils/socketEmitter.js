class SocketEmitter {
    emitToUser(io, userId, event, payload = {}) {
        io.to(`user_${userId}`).emit(event, payload);
    }
    incomingcall(io, receiverId, payload) {
        this.emitToUser(io, receiverId, "incomingcall", payload);
    }
    callAccepted(io, receiverId, payload) {
        this.emitToUser(io, receiverId, "callAccepted", payload);
    }
    callRejected(io, receiverId, payload) {
        this.emitToUser(io, receiverId, "callRejected", payload);
    }
    callBusy(io, receiverId, payload){
        this.emitToUser(io, receiverId, "callBusy", payload)
    }
    missedCall(io, receiverId, payload){
        this.emitToUser(io, receiverId, "missedCall", payload)
    }
    offer(io, receiverId, payload){
        this.emitToUser(io, receiverId, "offer", payload)
    }
    answer(io, receiverId, payload){
        this.emitToUser(io, receiverId, "answer", payload)
    }
    iceCandidate(io, receiverId, payload){
        this.emitToUser(io, receiverId, "iceCandidate", payload)
    }
    endCall(io, receiverId, payload){
        this.emitToUser(io, receiverId, "endCall", payload)
    }
    userLeft(io, receiverId, payload){
        this.emitToUser(io, receiverId, "userLeft", payload)
    }
    cameraToggle(io, receiverId, payload){
        this.emitToUser(io, receiverId, "cameraToggle", payload)
    }
    micToggle(io, receiverId, payload){
        this.emitToUser(io, receiverId, "micToggle", payload)
    }
    screenShare(io, receiverId, payload){
        this.emitToUser(io, receiverId, "screenShare", payload)
    }
    connectionLost(io, receiverId, payload){
        this.emitToUser(io, receiverId, "connectionLost", payload)
    }
    reconnected(io, receiverId, payload){
        this.emitToUser(io, receiverId, "reconnected", payload)
    }
}
module.exports = new SocketEmitter();