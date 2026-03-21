import { Link } from "react-router-dom";
import { Brain, ArrowRight, Repeat, Users, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="container flex items-center justify-between py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">BarterBrain</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" asChild><Link to="/login">Login</Link></Button>
          <Button asChild><Link to="/signup">Get Started</Link></Button>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-20 text-center animate-fade-in">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-card">
            <Repeat className="h-4 w-4 text-primary" />
            Skill exchange made simple
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl md:text-6xl">
            Exchange Skills.<br />
            <span className="text-gradient">Learn Together.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground">
            Connect with people who have the skills you need. Trade your expertise — no money required. Your knowledge is your currency.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/signup">Start Bartering <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/explore">Explore Skills</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Repeat, title: "Skill Exchange", desc: "Trade your expertise with others. Teach what you know, learn what you don't." },
            { icon: Users, title: "Smart Matching", desc: "Our algorithm finds the perfect skill exchange partners based on your interests." },
            { icon: Coins, title: "Credit System", desc: "Earn credits for teaching and spend them on learning. Fair and transparent." },
          ].map((f, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>© 2025 BarterBrain. Exchange Skills. Learn Together.</p>
      </footer>
    </div>
  );
}
