import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Video, ArrowRight, User, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { barterService, type BarterRequest } from "@/services/api";
import { UserAvatar } from "@/components/SharedComponents";
import { useAuth } from "@/context/AuthContext";

export default function ConnectionsPage() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<BarterRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response: any = await barterService.getRequests();
        const all = [...response.data.incoming, ...response.data.outgoing];
        setConnections(all.filter((r) => r.status === "accepted"));
      } catch (err) {
        console.error("Failed to fetch connections", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConnections();
    }
  }, [user]);

  if (loading) {
    return <div className="py-20 text-center">Loading connections...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">My Connections</h1>
        <p className="text-sm text-muted-foreground">Active barters you can chat and call with</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {connections.map((conn) => {
          const otherUser = conn.requester_id === user?.id ? conn.receiver : conn.requester;
          if (!otherUser) return null;
          
          return (
            <div key={conn.id} className="group relative rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-card-hover hover:border-primary/50">
              <div className="flex flex-col items-center text-center gap-3">
                <UserAvatar name={otherUser.name} className="h-16 w-16 text-lg" />
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="font-bold text-foreground">{otherUser.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-warning">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>{otherUser.avg_rating || "0.0"}</span>
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap justify-center gap-1">
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {conn.requester_skill?.name || "Skill"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">↔</span>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {conn.receiver_skill?.name || "Skill"}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 flex w-full gap-2">
                  <Button asChild className="flex-1" variant="default">
                    <Link to={`/connections/${conn.id}`}>
                      <MessageSquare className="mr-2 h-4 w-4" /> Connect
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {connections.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No active connections</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2">
              Accept a barter request or wait for others to accept yours to start connecting!
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/requests">View Requests</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
