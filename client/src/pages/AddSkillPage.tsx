import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { allSkills } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

import { skillService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function AddSkillPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [skill, setSkill] = useState("");
  const [type, setType] = useState<"offered" | "wanted">("offered");
  const [level, setLevel] = useState("Intermediate");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill || !description) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const skillData = { name: skill, level, description };
      if (type === "offered") {
        await skillService.addOffered(skillData);
      } else {
        await skillService.addWanted(skillData);
      }
      toast({ title: `Skill "${skill}" added successfully!` });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: err.message || "Failed to add skill", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg animate-fade-in">
      <h1 className="mb-2 font-display text-2xl font-bold text-foreground">Add a Skill</h1>
      <p className="mb-8 text-sm text-muted-foreground">Add a skill you can offer or want to learn</p>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-card">
        <div>
          <Label>Skill</Label>
          <select
            className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
          >
            <option value="">Select a skill</option>
            {allSkills.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <Label>Type</Label>
          <div className="mt-1.5 flex gap-2">
            <button
              type="button"
              onClick={() => setType("offered")}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                type === "offered" ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground hover:bg-muted"
              }`}
            >
              I can teach this
            </button>
            <button
              type="button"
              onClick={() => setType("wanted")}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                type === "wanted" ? "border-accent bg-accent/10 text-accent" : "border-input text-muted-foreground hover:bg-muted"
              }`}
            >
              I want to learn
            </button>
          </div>
        </div>

        <div>
          <Label>Skill Level</Label>
          <div className="mt-1.5 flex gap-2">
            {["Beginner", "Intermediate", "Expert"].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  level === l ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground hover:bg-muted"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="desc">Description</Label>
          <Input
            id="desc"
            placeholder="Brief description of your skill or what you want to learn"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          <Plus className="mr-1 h-4 w-4" />
          {loading ? "Adding..." : "Add Skill"}
        </Button>
      </form>
    </div>
  );
}
