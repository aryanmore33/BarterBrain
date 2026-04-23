import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { socketService } from "@/services/socket";

export default function MeetingNotification() {
  const navigate = useNavigate();

  useEffect(() => {
    const onNotification = (data: { barterId: string; callerName: string; type: string }) => {
      if (data.type === "incoming_call") {
        toast.custom((t) => (
          <div className="bg-card border border-border p-4 rounded-xl shadow-2xl animate-in slide-in-from-right-full flex items-center gap-4 min-w-[300px]">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Video className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{data.callerName}</p>
              <p className="text-xs text-muted-foreground">Is calling you for a meeting</p>
            </div>
            <div className="flex flex-col gap-1">
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white text-[10px] h-8"
                onClick={() => {
                  toast.dismiss(t);
                  navigate(`/connections/${data.barterId}`);
                }}
              >
                Join Meeting
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[10px] h-8"
                onClick={() => toast.dismiss(t)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        ), {
          duration: 15000, // 15 seconds
          position: "top-right",
        });
      }
    };

    socketService.onMeetingNotification(onNotification);
    return () => socketService.offMeetingNotification(onNotification);
  }, [navigate]);

  return null;
}
