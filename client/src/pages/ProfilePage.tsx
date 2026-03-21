import { useState } from "react";
import { Edit, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { currentUser } from "@/services/api";
import { UserAvatar } from "@/components/SharedComponents";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);

  const reviews = [
    { id: 1, name: "Sarah Chen", rating: 5, text: "Amazing React tutor! Patient and knowledgeable.", date: "Mar 10, 2025" },
    { id: 2, name: "James Wilson", rating: 5, text: "Great UI/UX sessions. Learned a lot about design principles.", date: "Feb 20, 2025" },
    { id: 3, name: "Priya Patel", rating: 4, text: "Very helpful with TypeScript concepts. Would barter again!", date: "Feb 15, 2025" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      {/* Profile header */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <UserAvatar name={currentUser.name} className="h-20 w-20 text-2xl" />
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-foreground">{currentUser.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{currentUser.bio}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <div className="flex items-center gap-1 text-sm text-warning">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-medium">{currentUser.rating}</span>
                <span className="text-muted-foreground">({currentUser.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> Remote
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            setEditing(!editing);
            if (editing) toast({ title: "Profile updated!" });
          }}>
            <Edit className="mr-1 h-4 w-4" />
            {editing ? "Save" : "Edit Profile"}
          </Button>
        </div>
      </div>

      {/* Skills */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Skills I Know</h2>
          <div className="space-y-3">
            {currentUser.skillsOffered.map((s) => (
              <div key={s.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{s.name}</span>
                    <Badge variant="offered">{s.level}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Skills I Want to Learn</h2>
          <div className="space-y-3">
            {currentUser.skillsWanted.map((s) => (
              <div key={s.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent text-xs font-bold">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{s.name}</span>
                    <Badge variant="wanted">{s.level}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Reviews</h2>
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserAvatar name={r.name} className="h-8 w-8 text-xs" />
                  <span className="text-sm font-medium text-foreground">{r.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
              <p className="mt-1 text-xs text-muted-foreground">{r.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
