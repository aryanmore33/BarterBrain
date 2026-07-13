const CallService = require("../../businessLogic/managers/callManager");
const socketEmitter = require("./socketEmitter");
const callTimeoutManager = require("../../businessLogic/managers/callTimeoutManager");

const callService = new CallService(socket.userId);

module.exports = (io, socket) => {
    socket.on("call-user", async (payload, ack = () => {}) => {
        try {
            const { barterRequestId } = payload;
            const { call, receiverId } = await callService.startCall({
                barterRequestId,
                initiatorId: socket.userId
            });
            socketEmitter.incomingcall(io, receiverId, {
                callId: call.id,
                barterRequestId,
                initiatorId: socket.userId,
                createdAt: call.created_at
            })
            callTimeoutManager.start(io, call.id, socket.userId);
            ack({ success: true, call })
        } catch (err) {
            ack({ success: false, error: err.message })
        }
    })

    socket.on("accept-call", async (payload, ack = () => {}) => {
        try{
            const { callId } = payload;
            const isParticipant = await callService.isParticipant({callId, userId: socket.userId});
            if(!isParticipant){
                ack({success: false, error: "You are not a participant of this call."})
                return;
            }
            const {call, callerId} = await callService.acceptCall({callId, userId: socket.userId});
            callTimeoutManager.clear(callId);
            socketEmitter.callAccepted(io, callerId, {
                callId: call.id,
                acceptedBy: socket.userId,
                startedAt: call.started_at
            })
            ack({ success: true, call, callerId });
        }catch(err){
            ack({ success: false, error: err.message })
        }
    })

    socket.on("reject-call", async (payload, ack = () => {}) => {
        try{
            const { callId } = payload;
            const isParticipant = await callService.isParticipant({callId, userId: socket.userId});
            if(!isParticipant){
                ack({success: false, error: "You are not a participant of this call."})
                return;
            }
            const {call, callerId} = await callService.rejectCall({callId, userId: socket.userId});
            callTimeoutManager.clear(callId);
            socketEmitter.callRejected(io, callerId, {
                callId: call.id,
                rejectedBy: socket.userId,
                rejectedAt: call.updated_at
            })
            ack({ success: true, call, callerId });
        }catch(err){
            ack({ success: false, error: err.message })
        }
    })

    socket.on("offer", async (payload, ack = () => {}) => {
        try{
            const { callId, offer } = payload;
            const isParticipant = await callService.isParticipant({callId, userId: socket.userId});
            if(!isParticipant){
                ack({success: false, error: "You are not a participant of this call."})
                return;
            }
            const {receiverId} = await callService.logOffer({callId, userId: socket.userId});
            socketEmitter.offer(io, receiverId, {
                callId: call.id,
                from: socket.userId,
                offer
            })
            ack({ success: true, call, callerId });
        }catch(err){
            ack({ success: false, error: err.message })
        }
    })

    socket.on("answer", async (payload, ack = () => {}) => {
        try{
            const { callId, answer } = payload;
            const isParticipant = await callService.isParticipant({callId, userId: socket.userId});
            if(!isParticipant){
                ack({success: false, error: "You are not a participant of this call."})
                return;
            }
            const {receiverId} = await callService.logAnswer({callId, userId: socket.userId});
            socketEmitter.answer(io, receiverId, {
                callId: call.id,
                from: socket.userId,
                answer
            })
            ack({ success: true, call, callerId });
        }catch(err){
            ack({ success: false, error: err.message })
        }
    })

    socket.on("ice_candidate", async (payload, ack = () => {}) => {
        try{
            const { callId, candidate } = payload;
            const isParticipant = await callService.isParticipant({callId, userId: socket.userId});
            if(!isParticipant){
                ack({success: false, error: "You are not a participant of this call."})
                return;
            }
            const {receiverId} = await callService.logIceCandidate({callId, userId: socket.userId});
            socketEmitter.iceCandidate(io, receiverId, {
                callId: call.id,
                from: socket.userId,
                candidate
            })
            ack({ success: true, call, callerId });
        }catch(err){
            ack({ success: false, error: err.message })
        }
    })

    socket.on("end_call", async (payload, ack = () => {}) => {
        try{
            const { callId } = payload;
            const isParticipant = await callService.isParticipant({callId, userId: socket.userId});
            if(!isParticipant){
                ack({success: false, error: "You are not a participant of this call."})
                return;
            }
            const {call, receiverId} = await callService.endCall({callId, userId: socket.userId});
            callTimeoutManager.clear(callId);
            socketEmitter.callEnded(io, receiverId, {
                callId: call.id,
                endedBy: socket.userId,
                endedAt: call.ended_at
            })
            ack({ success: true });
        }catch(err){
            ack({ success: false, error: err.message })
        }
    })

    socket.on("toggle_camera", async (payload, ack = () => {}) => {
        try{
            const { callId, enabled } = payload;
            const isParticipant = await callService.isParticipant({callId, userId: socket.userId});
            if(!isParticipant){
                ack({success: false, error: "You are not a participant of this call."})
                return;
            }
            const {receiverId} = await callService.toggleCamera({callId, userId: socket.userId, enabled});
            socketEmitter.cameraToggled(io, receiverId, {
                callId: call.id,
                from: socket.userId,
                enabled
            })
            ack({ success: true, call, callerId });
        }catch(err){
            ack({ success: false, error: err.message })
        }
    })
    socket.on("toggle_mic", async (payload, ack = () => {}) => {
        try{
            const { callId, enabled } = payload;
            const isParticipant = await callService.isParticipant({callId, userId: socket.userId});
            if(!isParticipant){
                ack({success: false, error: "You are not a participant of this call."})
                return;
            }
            const {receiverId} = await callService.toggleMicrophone({callId, userId: socket.userId, enabled});
            socketEmitter.microphoneToggled(io, receiverId, {
                callId: call.id,
                from: socket.userId,
                enabled
            })
            ack({ success: true, call, callerId });
        }catch(err){
            ack({ success: false, error: err.message })
        }
    })
    socket.on("toggle_screen_share", async (payload, ack = () => {}) => {
        try{
            const { callId, enabled } = payload;
            const isParticipant = await callService.isParticipant({callId, userId: socket.userId});
            if(!isParticipant){
                ack({success: false, error: "You are not a participant of this call."})
                return;
            }
            const {receiverId} = await callService.toggleScreenShare({callId, userId: socket.userId, enabled});
            socketEmitter.screenShareToggled(io, receiverId, {
                callId: call.id,
                from: socket.userId,
                enabled
            })
            ack({ success: true, call, callerId });
        }catch(err){
            ack({ success: false, error: err.message })
        }
    })

    socket.on("leave_call", async (payload, ack = () => {}) => {
        try{
            const { callId } = payload;
            const isParticipant = await callService.isParticipant({callId, userId: socket.userId});
            if(!isParticipant){
                ack({success: false, error: "You are not a participant of this call."})
                return;
            }
            const {receiverId} = await callService.leaveCall({callId, userId: socket.userId});
            socketEmitter.callLeft(io, receiverId, {
                callId: call.id,
                from: socket.userId
            })
            ack({ success: true, call, callerId });
        }catch(err){
            ack({ success: false, error: err.message })
        }
    })

    socket.on("disconnect", async () => {
        console.log(`User disconnected : ${socket.userId}`);
    })
}