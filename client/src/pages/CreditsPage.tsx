import { Coins, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { currentUser, creditTransactions } from "@/services/api";

export default function CreditsPage() {
  const totalEarned = creditTransactions.filter((t) => t.type === "earned").reduce((a, t) => a + t.amount, 0);
  const totalSpent = creditTransactions.filter((t) => t.type === "spent").reduce((a, t) => a + t.amount, 0);

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Credits</h1>
        <p className="text-sm text-muted-foreground">Track your skill exchange credits</p>
      </div>

      {/* Balance */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card text-center">
        <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-primary/10">
          <Coins className="h-7 w-7 text-primary" />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Current Balance</p>
        <p className="font-display text-4xl font-bold text-foreground">{currentUser.credits}</p>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-1 text-success">
            <ArrowUpRight className="h-4 w-4" /> Earned: {totalEarned}
          </div>
          <div className="flex items-center gap-1 text-destructive">
            <ArrowDownRight className="h-4 w-4" /> Spent: {totalSpent}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="border-b border-border p-4">
          <h2 className="font-display font-semibold text-foreground">Transaction History</h2>
        </div>
        <div className="divide-y divide-border">
          {creditTransactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  t.type === "earned" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                }`}>
                  {t.type === "earned" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{t.date}</p>
                </div>
              </div>
              <Badge variant={t.type === "earned" ? "success" : "destructive"}>
                {t.type === "earned" ? "+" : "-"}{t.amount}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
