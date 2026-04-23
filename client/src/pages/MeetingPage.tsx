import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Mic, MicOff, Video as VideoIcon, VideoOff,
  ScreenShare, StopCircle, PhoneOff, Send,
  Maximize2, Minimize2, Users, MessageSquare,
  ArrowLeft, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { barterService, chatService, type Message, type BarterRequest } from "@/services/api";
import { socketService } from "@/services/socket";
import { useWebRTC } from "@/hooks/useWebRTC";
import { UserAvatar } from "@/components/SharedComponents";
import ReviewModal from "@/components/ReviewModal";

export default function MeetingPage() {
  const { barterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [barter, setBarter] = useState<BarterRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const otherUser = barter ? (barter.requester_id === user?.id ? barter.receiver : barter.requester) : null;

  const {
    localStream,
    remoteStream,
    isCalling,
    isReceivingCall,
    startCall,
    answerCall,
    declineCall,
    endCall,
    toggleScreenShare,
    isScreenSharing,
    localVideoRef,
    remoteVideoRef
  } = useWebRTC(barterId || "");

  useEffect(() => {
    const init = async () => {
      try {
        const response: any = await barterService.getRequests();
        const found = [...response.data.incoming, ...response.data.outgoing].find(b => b.id === barterId);

        if (!found) {
          navigate("/connections");
          return;
        }
        setBarter(found);

        // Load chat history
        const chatResponse: any = await chatService.getHistory(barterId!);
        setMessages(chatResponse.data || []);

        socketService.connect();
        socketService.joinRoom(barterId!);
      } catch (err) {
        console.error("Failed to initialize meeting", err);
        navigate("/connections");
      }
    };

    if (barterId && user) {
      init();
    }

    // Listen for new messages
    socketService.onMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      // socketService.disconnect();
    };
  }, [barterId, user, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !barterId) return;

      const msg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        barter_id: barterId,
        sender_id: user!.id,
        message: newMessage,
        created_at: new Date().toISOString()
      };

      socketService.sendMessage(barterId, newMessage);
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    };

    if (!barter || !otherUser) return null;

    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] gap-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/connections")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <UserAvatar name={otherUser.name} className="h-10 w-10" />
              <div>
                <h2 className="font-bold leading-tight">{otherUser.name}</h2>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {barter.requester_skill?.name || "Skill"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {barter.receiver_skill?.name || "Skill"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowReview(true)} className="border-warning/50 text-warning hover:bg-warning/10">
              <Star className="mr-1 h-4 w-4" /> Rate Experience
            </Button>
            {!isCalling && !isReceivingCall && (
              <Button onClick={startCall} className="bg-green-600 hover:bg-green-700">
                <VideoIcon className="mr-2 h-4 w-4" /> Start Meeting
              </Button>
            )}
            {isReceivingCall && (
              <div className="flex gap-2 animate-bounce">
                <Button onClick={answerCall} className="bg-green-600 hover:bg-green-700">Accept Call</Button>
                <Button onClick={declineCall} variant="destructive">Decline</Button>
              </div>
            )}
            {isCalling && (
              <Button onClick={endCall} variant="destructive">
                <PhoneOff className="mr-2 h-4 w-4" /> End
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Left: Video Area */}
          <div className="flex-[2] flex flex-col gap-4">
            <div className="flex-1 bg-black rounded-xl overflow-hidden relative shadow-2xl border-4 border-muted/50">
              {/* Remote Video */}
              {remoteStream ? (
                <video
                  ref={(el) => {
                    if (el) el.srcObject = remoteStream;
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/50 gap-4">
                  <UserAvatar name={otherUser.name} className="h-32 w-32 text-4xl bg-muted/20 border-2 border-white/10" />
                  <p className="text-xl font-medium">{isCalling ? "Connecting..." : "Waiting for meeting to start..."}</p>
                </div>
              )}

              {/* Local Video Overlay */}
              <div className="absolute bottom-4 right-4 w-48 aspect-video bg-muted rounded-lg overflow-hidden border-2 border-white/20 shadow-lg z-10">
                {localStream ? (
                  <video
                    ref={(el) => {
                      if (el) el.srcObject = localStream;
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <VideoOff className="h-8 w-8 text-white/20" />
                  </div>
                )}
                <div className="absolute bottom-1 left-2 text-[10px] text-white bg-black/50 px-1 rounded">You</div>
              </div>

              {/* Controls Overlay */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("rounded-full h-12 w-12", !micOn && "bg-destructive text-white hover:bg-destructive/80")}
                  onClick={() => setMicOn(!micOn)}
                >
                  {micOn ? <Mic /> : <MicOff />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("rounded-full h-12 w-12", !videoOn && "bg-destructive text-white hover:bg-destructive/80")}
                  onClick={() => setVideoOn(!videoOn)}
                >
                  {videoOn ? <VideoIcon /> : <VideoOff />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("rounded-full h-12 w-12", isScreenSharing && "bg-primary text-white hover:bg-primary/80")}
                  onClick={toggleScreenShare}
                  disabled={!isCalling}
                >
                  {isScreenSharing ? <StopCircle className="text-white" /> : <ScreenShare />}
                </Button>
                <div className="w-[1px] h-8 bg-white/10 mx-1" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="rounded-full h-12 w-12"
                  onClick={() => { endCall(); navigate("/connections"); }}
                >
                  <PhoneOff />
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Chat Area */}
          <div className="flex-1 flex flex-col bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Chat
              </h3>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                      <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm shadow-sm ${isMine ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none"
                        }`}>
                        {msg.message}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-border flex gap-2 bg-muted/10">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="rounded-full bg-background"
              />
              <Button type="submit" size="icon" className="rounded-full shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {showReview && otherUser && (
          <ReviewModal
            barterId={barterId!}
            userName={otherUser.name}
            onClose={() => setShowReview(false)}
          />
        )}
      </div>
    );
}

// Helper for classNames
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
