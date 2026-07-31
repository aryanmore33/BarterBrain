import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mic, MicOff, MonitorUp, PhoneOff, Star, Video, VideoOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/SharedComponents";
import ReviewModal from "@/components/ReviewModal";
import { useAuth } from "@/context/AuthContext";
import { barterService, type BarterRequest } from "@/services/api";
import { socketService } from "@/services/socket";
import { useWebRTC } from "@/hooks/useWebRTC";
import { cn } from "@/lib/utils";

export default function MeetingPage() {
  const { barterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [barter, setBarter] = useState<BarterRequest | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const otherUser = useMemo(
    () => barter ? (barter.requester_id === user?.id ? barter.receiver : barter.requester) : null,
    [barter, user?.id]
  );
  const {
    localStream, remoteStream, isCalling, isReceivingCall, startCall, answerCall,
    declineCall, endCall, toggleScreenShare, isScreenSharing, toggleVideo, toggleAudio
  } = useWebRTC(barterId ?? "");

  useEffect(() => {
    if (!barterId || !user) return;
    const load = async () => {
      try {
        const response: any = await barterService.getRequests();
        const requests = [...(response.data?.incoming ?? []), ...(response.data?.outgoing ?? [])];
        const connection = requests.find((item: BarterRequest) => item.id === barterId && item.status === "accepted");
        if (!connection) return navigate("/connections", { replace: true });
        setBarter(connection);
        socketService.connect();
      } catch (error) {
        console.error("Unable to open call", error);
        navigate("/connections", { replace: true });
      }
    };
    void load();
  }, [barterId, user, navigate]);

  useEffect(() => {
    if (isCalling && !startedAt) setStartedAt(Date.now());
    if (!isCalling) setStartedAt(null);
  }, [isCalling, startedAt]);

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startedAt) return;
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  const leave = () => {
    endCall();
    navigate(`/connections/${barterId}`);
  };
  const duration = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  if (!barter || !otherUser) return <div className="min-h-screen bg-[#202124]" />;

  return (
    <main className="min-h-screen bg-[#202124] p-4 text-white md:p-6">
      <header className="flex items-center justify-between gap-3 pb-5">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" className="shrink-0 text-white hover:bg-white/10 hover:text-white" onClick={() => navigate(`/connections/${barterId}`)} aria-label="Back to chat"><ArrowLeft /></Button>
          <div className="min-w-0"><h1 className="truncate font-semibold">{otherUser.name} • Skill exchange</h1><p className="text-sm text-white/60">{isCalling ? duration : "Ready to join"}</p></div>
        </div>
        <div className="flex items-center gap-2"><Badge className="gap-1 bg-white/10 text-white hover:bg-white/10"><Users className="h-3.5 w-3.5" /> 2</Badge><Button variant="ghost" className="hidden text-white hover:bg-white/10 hover:text-white sm:flex" onClick={() => navigate(`/connections/${barterId}`)}>Back to chat</Button></div>
      </header>

      <section className="relative mx-auto flex h-[calc(100vh-11rem)] max-w-7xl items-center justify-center overflow-hidden rounded-3xl bg-[#303134] shadow-2xl">
        {remoteStream ? <video ref={node => { if (node) node.srcObject = remoteStream; }} autoPlay playsInline className="h-full w-full object-cover" /> : <div className="flex flex-col items-center gap-5 text-center"><UserAvatar name={otherUser.name} className="h-32 w-32 border-4 border-white/10 text-4xl" /><div><p className="text-xl font-medium">{isCalling ? "Connecting to " + otherUser.name : "Start a video call"}</p><p className="mt-1 text-sm text-white/60">Your conversation stays separate in chat.</p></div></div>}
        <div className="absolute bottom-5 right-5 aspect-video w-40 overflow-hidden rounded-2xl border border-white/20 bg-[#3c4043] shadow-xl sm:w-56">
          {localStream && videoOn ? <video ref={node => { if (node) node.srcObject = localStream; }} autoPlay playsInline muted className="h-full w-full object-cover -scale-x-100" /> : <div className="flex h-full items-center justify-center"><UserAvatar name="You" className="h-16 w-16" /></div>}
          <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs">You {!micOn && "• muted"}</span>
        </div>
      </section>

      {isReceivingCall && <div className="fixed inset-x-0 bottom-28 z-10 flex justify-center gap-3"><Button className="bg-emerald-600 hover:bg-emerald-700" onClick={answerCall}>Accept</Button><Button variant="destructive" onClick={declineCall}>Decline</Button></div>}
      <footer className="fixed inset-x-0 bottom-5 flex justify-center"><div className="flex items-center gap-3 rounded-full bg-[#303134] p-3 shadow-xl">
        <Button size="icon" className={cn("h-12 w-12 rounded-full bg-[#3c4043] hover:bg-[#4a4d51]", !micOn && "bg-red-700 hover:bg-red-700")} onClick={() => { const next = !micOn; setMicOn(next); toggleAudio(next); }}>{micOn ? <Mic /> : <MicOff />}</Button>
        <Button size="icon" className={cn("h-12 w-12 rounded-full bg-[#3c4043] hover:bg-[#4a4d51]", !videoOn && "bg-red-700 hover:bg-red-700")} onClick={() => { const next = !videoOn; setVideoOn(next); toggleVideo(next); }}>{videoOn ? <Video /> : <VideoOff />}</Button>
        <Button size="icon" className={cn("hidden h-12 w-12 rounded-full bg-[#3c4043] hover:bg-[#4a4d51] sm:inline-flex", isScreenSharing && "bg-indigo-600 hover:bg-indigo-600")} onClick={toggleScreenShare} disabled={!isCalling}><MonitorUp /></Button>
        <Button size="icon" className="hidden h-12 w-12 rounded-full bg-[#3c4043] hover:bg-[#4a4d51] sm:inline-flex" onClick={() => setShowReview(true)}><Star /></Button>
        {!isCalling && !isReceivingCall ? <Button className="h-12 rounded-full bg-emerald-600 px-5 hover:bg-emerald-700" onClick={startCall}>Join call</Button> : <Button size="icon" className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700" onClick={leave}><PhoneOff /></Button>}
      </div></footer>
      {showReview && <ReviewModal barterId={barterId!} userName={otherUser.name} onClose={() => setShowReview(false)} />}
    </main>
  );
}
