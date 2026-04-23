import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { barterService, type BarterRequest } from "@/services/api";
import { UserAvatar } from "@/components/SharedComponents";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
// import ChatPanel from "@/components/ChatPanel"; // Removing as we have MeetingPage

type Tab = "incoming" | "sent" | "completed";

export default function RequestsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("incoming");
  const [incoming, setIncoming] = useState<BarterRequest[]>([]);
  const [sent, setSent] = useState<BarterRequest[]>([]);
  const [completed, setCompleted] = useState<BarterRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const response: any = await barterService.getRequests();
      setIncoming(response.data.incoming || []);
      setSent(response.data.outgoing || []);
      setCompleted([...(response.data.incoming || []), ...(response.data.outgoing || [])].filter(r => r.status === 'completed'));
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await barterService.updateStatus(id, status);
      toast({ title: `Request ${status}` });
      fetchRequests();
    } catch (err: any) {
      toast({ title: err.message || "Action failed", variant: "destructive" });
    }
  };

  const currentList = activeTab === "incoming" ? incoming : activeTab === "sent" ? sent : completed;

  if (loading) {
    return <div className="py-20 text-center">Loading requests...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Barter Requests</h1>
        <p className="text-sm text-muted-foreground">Manage your skill exchange requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
        {(["incoming", "sent", "completed"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Request cards */}
      <div className="space-y-3">
        {currentList.map((req) => {
          const isRequester = req.requester_id === user?.id;
          const otherUser = isRequester ? req.receiver : req.requester;
          if (!otherUser) return null;

          return (
            <div key={req.id} className="rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar name={otherUser.name} className="h-11 w-11" />
                  <div>
                    <h3 className="font-medium text-foreground">{otherUser.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      <Badge variant="offered" className="mr-1">
                        {req.requester_skill?.name || "Skill"}
                      </Badge>
                      ↔
                      <Badge variant="wanted" className="ml-1">
                        {req.receiver_skill?.name || "Skill"}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {activeTab === "incoming" && req.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => handleStatusUpdate(req.id, "accepted")}>
                        <Check className="mr-1 h-4 w-4" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(req.id, "rejected")}>
                        <X className="mr-1 h-4 w-4" /> Decline
                      </Button>
                    </>
                  )}
                  {req.status === "accepted" && (
                    <Button asChild size="sm" variant="default">
                      <Link to={`/connections/${req.id}`}>
                        <MessageCircle className="mr-1 h-4 w-4" /> Connect
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {currentList.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No {activeTab} requests yet.
          </div>
        )}
      </div>
    </div>
  );
}
