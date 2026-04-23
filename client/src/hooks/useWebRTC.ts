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
  const [incomingOffer, setIncomingOffer] = useState<any>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  // Buffer ICE candidates received before remote description is set
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
    setIncomingOffer(null);
    setIsScreenSharing(false);
    iceCandidateBuffer.current = [];
    remoteDescSet.current = false;
  }, []);

  // ✅ FIX: Accept stream as parameter so we don't read stale React state
  const setupPeerConnection = useCallback((stream: MediaStream) => {
    // Close any existing connection first
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    iceCandidateBuffer.current = [];
    remoteDescSet.current = false;

    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.emitIceCandidate(barterId, event.candidate);
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      console.log("WebRTC connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setIsCalling(true);
      }
    };

    // ✅ FIX: Use passed stream, not stale state
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    peerConnection.current = pc;
    return pc;
  }, [barterId]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setIsCalling(true);

      // ✅ FIX: Pass stream directly instead of relying on state
      const pc = setupPeerConnection(stream);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketService.emitCall(barterId, offer);
    } catch (error) {
      console.error("Error starting call:", error);
      setIsCalling(false);
    }
  };

  const handleIncomingCall = useCallback(({ offer }: { offer: any }) => {
    setIncomingOffer(offer);
    setIsReceivingCall(true);
  }, []);

  const answerCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      // ✅ FIX: Pass stream directly
      const pc = setupPeerConnection(stream);
      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      remoteDescSet.current = true;

      // ✅ FIX: Flush buffered ICE candidates
      for (const candidate of iceCandidateBuffer.current) {
        await pc.addIceCandidate(candidate).catch(console.warn);
      }
      iceCandidateBuffer.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketService.emitAnswer(barterId, answer);
      setIsReceivingCall(false);
      setIsCalling(true);
    } catch (error) {
      console.error("Error answering call:", error);
    }
  };

  const declineCall = () => {
    socketService.emitDeclineCall(barterId);
    setIsReceivingCall(false);
    setIncomingOffer(null);
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

      setIsScreenSharing(false);
    } catch (error) {
      console.error("Error stopping screen share:", error);
    }
  };

  useEffect(() => {
    const onIncomingCall = (data: { offer: any; from: string }) =>
      handleIncomingCall({ offer: data.offer });

    const onCallAccepted = async ({ answer }: { answer: any }) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        remoteDescSet.current = true;

        // ✅ FIX: Flush any buffered ICE candidates
        for (const candidate of iceCandidateBuffer.current) {
          await peerConnection.current.addIceCandidate(candidate).catch(console.warn);
        }
        iceCandidateBuffer.current = [];
      }
    };

    const onIceCandidate = ({ candidate }: { candidate: any }) => {
      if (!peerConnection.current) return;

      const iceCandidate = new RTCIceCandidate(candidate);

      if (remoteDescSet.current) {
        // Remote description already set — add immediately
        peerConnection.current.addIceCandidate(iceCandidate).catch(console.warn);
      } else {
        // ✅ FIX: Buffer until remote description is set
        iceCandidateBuffer.current.push(iceCandidate);
      }
    };

    const onCallEnded = () => cleanup();
    const onCallDeclined = () => cleanup();

    socketService.onIncomingCall(onIncomingCall);
    socketService.onCallAccepted(onCallAccepted);
    socketService.onIceCandidate(onIceCandidate);
    socketService.onCallEnded(onCallEnded);
    socketService.onCallDeclined(onCallDeclined);

    return () => {
      socketService.offIncomingCall(onIncomingCall);
      socketService.offCallAccepted(onCallAccepted);
      socketService.offIceCandidate(onIceCandidate);
      socketService.offCallEnded(onCallEnded);
      socketService.offCallDeclined(onCallDeclined);
    };
  }, [barterId, handleIncomingCall, cleanup]);

  return {
    localStream,
    remoteStream,
    isCalling,
    isReceivingCall,
    startCall,
    answerCall,
    declineCall,
    endCall: () => {
      socketService.emitEndCall(barterId);
      cleanup();
    },
    toggleScreenShare,
    isScreenSharing,
    localVideoRef,
    remoteVideoRef,
  };
}
