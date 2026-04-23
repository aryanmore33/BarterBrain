import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { users, allSkills } from "@/services/api";
import { UserAvatar } from "@/components/SharedComponents";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function ExplorePage() {
  const { toast } = useToast();
  const { user: me } = useAuth();
  const [search, setSearch] = useState("");
  const [filterSkill, setFilterSkill] = useState("");

  const otherUsers = users.filter((u) => u.id !== me?.id);

  const filtered = otherUsers.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.skillsOffered.some((s) => s.name.toLowerCase().includes(search.toLowerCase())) ||
      u.skillsWanted.some((s) => s.name.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = !filterSkill || u.skillsOffered.some((s) => s.name === filterSkill);
    return matchesSearch && matchesFilter;
  });

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
                <p className="text-xs text-muted-foreground">⭐ {user.rating} · {user.reviewCount} reviews</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Offers</p>
              <div className="flex flex-wrap gap-1.5">
                {user.skillsOffered.map((s) => (
                  <Badge key={s.id} variant="offered">{s.name}</Badge>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Wants</p>
              <div className="flex flex-wrap gap-1.5">
                {user.skillsWanted.map((s) => (
                  <Badge key={s.id} variant="wanted">{s.name}</Badge>
                ))}
              </div>
            </div>

            <Button
              className="mt-4 w-full"
              size="sm"
              onClick={() => toast({ title: `Barter request sent to ${user.name}!` })}
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
