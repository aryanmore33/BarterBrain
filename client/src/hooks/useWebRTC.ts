import { useEffect, useRef, useState, useCallback } from "react";
import { socketService } from "@/services/socket";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useWebRTC(barterId: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState<any>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const currentCallId = useRef<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const iceCandidateBuffer = useRef<RTCIceCandidate[]>([]);
  const remoteDescSet = useRef(false);

  const cleanup = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setLocalStream((prev) => {
      if (prev) prev.getTracks().forEach((t) => t.stop());
      return null;
    });
    setRemoteStream(null);
    setIsCalling(false);
    setIsReceivingCall(false);
    setIncomingCallData(null);
    setIsScreenSharing(false);
    iceCandidateBuffer.current = [];
    remoteDescSet.current = false;
    currentCallId.current = null;
  }, []);

  const setupPeerConnection = useCallback((stream: MediaStream, callId: string) => {
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    iceCandidateBuffer.current = [];
    remoteDescSet.current = false;

    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && callId) {
        socketService.sendIceCandidate(callId, event.candidate);
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("WebRTC connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setIsCalling(true);
      } else if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        cleanup();
      }
    };

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    peerConnection.current = pc;
    return pc;
  }, [cleanup]);

  const startCall = async () => {
    if (!barterId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setIsCalling(true);

      socketService.startCall(barterId, async (response) => {
        if (response && response.success && response.call) {
          const callId = response.call.id;
          currentCallId.current = callId;
          const pc = setupPeerConnection(stream, callId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketService.sendOffer(callId, offer);
        } else {
          console.error("Failed to start call:", response?.error);
          cleanup();
        }
      });
    } catch (error) {
      console.error("Error starting call:", error);
      cleanup();
    }
  };

  const answerCall = async () => {
    if (!incomingCallData || !incomingCallData.callId) return;
    const callId = incomingCallData.callId;
    currentCallId.current = callId;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      socketService.acceptCall(callId, async (response) => {
        if (response && response.success) {
          setupPeerConnection(stream, callId);
          setIsReceivingCall(false);
          setIsCalling(true);
        } else {
          console.error("Failed to accept call:", response?.error);
          cleanup();
        }
      });
    } catch (error) {
      console.error("Error answering call:", error);
      cleanup();
    }
  };

  const declineCall = () => {
    if (incomingCallData?.callId) {
      socketService.rejectCall(incomingCallData.callId);
    }
    cleanup();
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        if (peerConnection.current) {
          const senders = peerConnection.current.getSenders();
          const videoSender = senders.find((s) => s.track?.kind === "video");
          if (videoSender) {
            videoSender.replaceTrack(screenTrack);
          }
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        if (currentCallId.current) {
          socketService.toggleScreenShare(currentCallId.current, true);
        }
        setIsScreenSharing(true);
      } catch (error) {
        console.error("Error sharing screen:", error);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = videoStream.getVideoTracks()[0];

      if (peerConnection.current) {
        const senders = peerConnection.current.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === "video");
        if (videoSender) {
          videoSender.replaceTrack(videoTrack);
        }
      }

      if (currentCallId.current) {
        socketService.toggleScreenShare(currentCallId.current, false);
      }
      setIsScreenSharing(false);
    } catch (error) {
      console.error("Error stopping screen share:", error);
    }
  };

  useEffect(() => {
    const handleIncomingCall = (data: { callId: string; barterRequestId: string; initiatorId: string }) => {
      if (data.barterRequestId === barterId) {
        setIncomingCallData(data);
        setIsReceivingCall(true);
      }
    };

    const handleOffer = async ({ callId, offer }: { callId: string; offer: any }) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        remoteDescSet.current = true;

        for (const candidate of iceCandidateBuffer.current) {
          await peerConnection.current.addIceCandidate(candidate).catch(console.warn);
        }
        iceCandidateBuffer.current = [];

        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socketService.sendAnswer(callId, answer);
      }
    };

    const handleAnswer = async ({ answer }: { answer: any }) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        remoteDescSet.current = true;

        for (const candidate of iceCandidateBuffer.current) {
          await peerConnection.current.addIceCandidate(candidate).catch(console.warn);
        }
        iceCandidateBuffer.current = [];
      }
    };

    const handleIceCandidate = ({ candidate }: { candidate: any }) => {
      if (!peerConnection.current || !candidate) return;

      const iceCandidate = new RTCIceCandidate(candidate);

      if (remoteDescSet.current) {
        peerConnection.current.addIceCandidate(iceCandidate).catch(console.warn);
      } else {
        iceCandidateBuffer.current.push(iceCandidate);
      }
    };

    const handleCallEnded = () => cleanup();
    const handleCallRejected = () => cleanup();
    const handleUserLeft = () => cleanup();

    socketService.onIncomingCall(handleIncomingCall);
    socketService.onOffer(handleOffer);
    socketService.onAnswer(handleAnswer);
    socketService.onIceCandidate(handleIceCandidate);
    socketService.onCallEnded(handleCallEnded);
    socketService.onCallRejected(handleCallRejected);
    socketService.onUserLeft(handleUserLeft);

    return () => {
      socketService.offIncomingCall(handleIncomingCall);
      socketService.offOffer(handleOffer);
      socketService.offAnswer(handleAnswer);
      socketService.offIceCandidate(handleIceCandidate);
      socketService.offCallEnded(handleCallEnded);
      socketService.offCallRejected(handleCallRejected);
      socketService.offUserLeft(handleUserLeft);
    };
  }, [barterId, cleanup]);

  return {
    localStream,
    remoteStream,
    isCalling,
    isReceivingCall,
    startCall,
    answerCall,
    declineCall,
    endCall: () => {
      if (currentCallId.current) {
        socketService.endCall(currentCallId.current);
      }
      cleanup();
    },
    toggleScreenShare,
    isScreenSharing,
    localVideoRef,
    remoteVideoRef,
    toggleVideo: (enabled: boolean) => {
      if (localStream) {
        localStream.getVideoTracks().forEach((track) => (track.enabled = enabled));
      }
      if (currentCallId.current) {
        socketService.toggleCamera(currentCallId.current, enabled);
      }
    },
    toggleAudio: (enabled: boolean) => {
      if (localStream) {
        localStream.getAudioTracks().forEach((track) => (track.enabled = enabled));
      }
      if (currentCallId.current) {
        socketService.toggleMic(currentCallId.current, enabled);
      }
    },
  };
}
