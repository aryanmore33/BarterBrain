import { useState } from "react";
import { Check, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { barterRequests, currentUser, type BarterRequest } from "@/services/api";
import { UserAvatar } from "@/components/SharedComponents";
import { useToast } from "@/hooks/use-toast";
import ChatPanel from "@/components/ChatPanel";

type Tab = "incoming" | "sent" | "completed";

export default function RequestsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("incoming");
  const [chatRequest, setChatRequest] = useState<BarterRequest | null>(null);

  const incoming = barterRequests.filter((r) => r.toUser.id === currentUser.id && r.status === "pending");
  const sent = barterRequests.filter((r) => r.fromUser.id === currentUser.id && (r.status === "pending" || r.status === "accepted"));
  const completed = barterRequests.filter((r) => r.status === "completed");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "incoming", label: "Incoming", count: incoming.length },
    { key: "sent", label: "Sent", count: sent.length },
    { key: "completed", label: "Completed", count: completed.length },
  ];

  const currentList = activeTab === "incoming" ? incoming : activeTab === "sent" ? sent : completed;

  if (chatRequest) {
    return <ChatPanel request={chatRequest} onBack={() => setChatRequest(null)} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Barter Requests</h1>
        <p className="text-sm text-muted-foreground">Manage your skill exchange requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label} {tab.count > 0 && <span className="ml-1 text-xs">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Request cards */}
      <div className="space-y-3">
        {currentList.map((req) => {
          const otherUser = req.fromUser.id === currentUser.id ? req.toUser : req.fromUser;
          return (
            <div key={req.id} className="rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar name={otherUser.name} className="h-11 w-11" />
                  <div>
                    <h3 className="font-medium text-foreground">{otherUser.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      <Badge variant="offered" className="mr-1">{req.skillOffered}</Badge>
                      ↔
                      <Badge variant="wanted" className="ml-1">{req.skillWanted}</Badge>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {activeTab === "incoming" && (
                    <>
                      <Button size="sm" onClick={() => toast({ title: `Accepted barter with ${otherUser.name}!` })}>
                        <Check className="mr-1 h-4 w-4" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toast({ title: "Request declined" })}>
                        <X className="mr-1 h-4 w-4" /> Decline
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setChatRequest(req)}>
                    <MessageCircle className="mr-1 h-4 w-4" /> Chat
                  </Button>
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
