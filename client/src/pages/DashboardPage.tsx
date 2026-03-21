import { Link } from "react-router-dom";
import { Plus, Compass, Star, ArrowUpRight, TrendingUp, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { currentUser } from "@/services/api";
import { UserAvatar } from "@/components/SharedComponents";

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <UserAvatar name={currentUser.name} className="h-14 w-14 text-lg" />
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Welcome back, {currentUser.name.split(" ")[0]}!
            </h1>
            <p className="text-sm text-muted-foreground">Ready to exchange some skills today?</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/add-skill"><Plus className="mr-1 h-4 w-4" /> Add Skill</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/explore"><Compass className="mr-1 h-4 w-4" /> Find Matches</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Coins} label="Credits" value={currentUser.credits.toString()} color="primary" />
        <StatCard icon={Star} label="Rating" value={`${currentUser.rating} / 5`} color="warning" />
        <StatCard icon={TrendingUp} label="Barters" value={currentUser.reviewCount.toString()} color="success" />
      </div>

      {/* Skills */}
      <div className="grid gap-6 md:grid-cols-2">
        <SkillSection title="Skills I Offer" skills={currentUser.skillsOffered} variant="offered" />
        <SkillSection title="Skills I Want" skills={currentUser.skillsWanted} variant="wanted" />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${
          color === "primary" ? "bg-primary/10 text-primary" :
          color === "warning" ? "bg-warning/10 text-warning" :
          "bg-success/10 text-success"
        }`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function SkillSection({ title, skills, variant }: {
  title: string;
  skills: typeof currentUser.skillsOffered;
  variant: "offered" | "wanted";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
        <Link to="/add-skill" className="text-sm text-primary hover:underline flex items-center gap-1">
          Add <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {skills.map((skill) => (
          <div key={skill.id} className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">{skill.name}</p>
              <p className="text-xs text-muted-foreground">{skill.description}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="level">{skill.level}</Badge>
              <Badge variant={variant}>{variant === "offered" ? "Offer" : "Want"}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
