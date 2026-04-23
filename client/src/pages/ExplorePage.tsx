import { useState, useEffect } from "react";
import { Search, Filter, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { matchService, barterService, skillService, allSkills } from "@/services/api";
import { UserAvatar } from "@/components/SharedComponents";
import { useToast } from "@/hooks/use-toast";

export default function ExplorePage() {
  const { toast } = useToast();
  const { user: me } = useAuth();
  const [search, setSearch] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response: any = await matchService.getMatches();
        setMatches(response.data || []);
      } catch (err) {
        console.error("Failed to fetch matches", err);
      } finally {
        setLoading(false);
      }
    };
    if (me) fetchMatches();
  }, [me]);

  const handleRequestBarter = async (targetUser: any) => {
    try {
      // 1. Fetch my offered skills
      const mySkillsResponse: any = await skillService.getMyOffered();
      const mySkills = mySkillsResponse.data || [];

      if (mySkills.length === 0) {
        toast({ 
          title: "No skills offered", 
          description: "You must add at least one skill you offer before requesting a barter.",
          variant: "destructive"
        });
        return;
      }

      // 2. For now, use the first available skill as the requester skill
      // In a full implementation, we'd show a modal to let the user choose.
      const mySkillId = mySkills[0].id;

      await barterService.createRequest({
        receiver_id: targetUser.id,
        requester_skill_id: mySkillId,
        receiver_skill_id: targetUser.receiver_skill_id,
        message: `Hi ${targetUser.name}, I'd like to barter my ${mySkills[0].name} for your ${targetUser.skill_name}!`
      });

      toast({ title: "Barter request sent!", description: `Request sent to ${targetUser.name}` });
    } catch (err: any) {
      toast({ title: err.message || "Failed to send request", variant: "destructive" });
    }
  };

  const filtered = matches.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.skill_name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = !filterSkill || u.skill_name === filterSkill;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="py-20 text-center">Finding matches for you...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Explore</h1>
        <p className="text-sm text-muted-foreground">Find people to exchange skills with</p>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
          >
            <option value="">All Skills</option>
            {allSkills.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* User cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((user) => (
          <div
            key={user.id}
            className="rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <UserAvatar name={user.name} className="h-12 w-12" />
              <div>
                <h3 className="font-display font-semibold text-foreground">{user.name}</h3>
                <div className="flex items-center gap-1 text-xs text-warning">
                  <Star className="h-3 w-3 fill-current" />
                  <span>{user.avg_rating}</span>
                  <span className="text-muted-foreground">({user.total_reviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Offers</p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="offered">{user.skill_name} ({user.level})</Badge>
              </div>
            </div>

            <Button
              className="mt-4 w-full"
              size="sm"
              onClick={() => handleRequestBarter(user)}
            >
              Request Barter
            </Button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No users found matching your search.
        </div>
      )}
    </div>
  );
}
