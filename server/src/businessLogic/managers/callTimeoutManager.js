const CallService = require("../services/CallService");
const socketEmitter = require("./socketEmitter");

const activeTimeouts = new Map();

function start(io, callId, callerId) {

    clear(callId);

    const timeout = setTimeout(async () => {

        try {

            const callService = new CallService(callerId);

            const call =
                await callService.getCall(callId);

            if (!call) return;

            if (call.status !== "ringing")
                return;

            const {
                receiverId
            } = await callService.missedCall(
                callId,
                callerId
            );

            socketEmitter.missedCall(io, callerId, {
                callId
            });

            socketEmitter.missedCall(io, receiverId, {
                callId
            });

        } catch (err) {

            console.error(err);

        } finally {

            activeTimeouts.delete(callId);

        }

    }, 30000);

    activeTimeouts.set(callId, timeout);

}

function clear(callId) {

    if (activeTimeouts.has(callId)) {

        clearTimeout(activeTimeouts.get(callId));

        activeTimeouts.delete(callId);

    }

}

module.exports = {

    start,

    clear

};