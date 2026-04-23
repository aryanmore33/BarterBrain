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

  const cleanup = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setIsCalling(false);
    setIsReceivingCall(false);
    setIncomingOffer(null);
    setIsScreenSharing(false);
  }, [localStream]);

  const setupPeerConnection = useCallback(async () => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.emitIceCandidate(barterId, event.candidate);
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    peerConnection.current = pc;
    return pc;
  }, [barterId, localStream]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setIsCalling(true);

      const pc = await setupPeerConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketService.emitCall(barterId, offer);
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  const handleIncomingCall = useCallback(async (offer: any) => {
    setIncomingOffer(offer);
    setIsReceivingCall(true);
  }, []);

  const answerCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      const pc = await setupPeerConnection();
      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
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

        // Handle stop sharing from browser UI
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
    socketService.onIncomingCall(({ offer }) => handleIncomingCall(offer));

    socketService.onCallAccepted(async ({ answer }) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socketService.onIceCandidate(({ candidate }) => {
      if (peerConnection.current) {
        peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socketService.onCallEnded(() => {
      cleanup();
    });

    socketService.onCallDeclined(() => {
      cleanup();
    });

    return () => {
      // Don't cleanup here as it might disrupt active calls on re-renders
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
    remoteVideoRef
  };
}
