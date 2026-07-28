const express = require("express");
const router = express.Router();

const CallService = require("../../businessLogic/managers/callManager");
const AppError = require("../../errorHandlers/AppError");
const { appWrapper } = require("../routeWrapper");

router.get("/:callId", appWrapper(async (req) => {
    const userId = req.user.id;
    const { callId } = req.params;
    const callService = new CallService(userId);
    const isParticipant = await callService.isParticipant(callId, userId);
    if (!isParticipant) {
        throw new AppError("You are not a participant of this call.", 403, "Forbidden");
    }
    const call = await callService.getCall(callId);
    return { success: true, data: call };
}));

router.get("/:callId/participants", appWrapper(async (req) => {
    const userId = req.user.id;
    const { callId } = req.params;
    const callService = new CallService(userId);
    const isParticipant = await callService.isParticipant(callId, userId);
    if (!isParticipant) {
        throw new AppError("You are not a participant of this call.", 403, "Forbidden");
    }
    const participants = await callService.getParticipants(callId);
    return {
        success: true,
        data: participants
    };
}));

router.get("/:callId/logs", appWrapper(async (req) => {
    const userId = req.user.id;
    const { callId } = req.params;
    const callService = new CallService(userId);
    const isParticipant = await callService.isParticipant(callId, userId);
    if (!isParticipant) {
        throw new AppError("You are not a participant of this call.", 403, "Forbidden");
    }
    const logs = await callService.getLogs(callId);
    return {
        success: true,
        data: logs
    };
}));

router.get("/barter/:barterRequestId", appWrapper(async (req) => {
    const userId = req.user.id;
    const { barterRequestId } = req.params;
    const callService = new CallService(userId);
    const hasAccess = await callService.validateBarterAccess(
        userId,
        barterRequestId
    );
    if (!hasAccess) {
        throw new AppError("Unauthorized", 403, "Forbidden");
    }
    const call = await callService.getCallByBarter(barterRequestId);
    return {
        success: true,
        data: call
    };
}));

router.get("/:callId/reconnect", appWrapper(async (req) => {
    const userId = req.user.id;
    const { callId } = req.params;
    const callService = new CallService(userId);
    const isParticipant = await callService.isParticipant(callId, userId);
    if (!isParticipant) {
        throw new AppError("You are not a participant of this call.", 403, "Forbidden");
    }
    const call = await callService.getCall(callId);
    if (!call || call.status !== "accepted") {
        throw new AppError("Call is not active.", 400, "Bad Request");
    }
    return {
        success: true,
        data: {
            reconnect: true,
            call
        }
    };
}));

module.exports = router;