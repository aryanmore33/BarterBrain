import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currentUser, type BarterRequest, type Message } from "@/services/api";
import { UserAvatar } from "@/components/SharedComponents";

interface ChatPanelProps {
  request: BarterRequest;
  onBack: () => void;
}

export default function ChatPanel({ request, onBack }: ChatPanelProps) {
  const otherUser = request.fromUser.id === currentUser.id ? request.toUser : request.fromUser;
  const [messages, setMessages] = useState<Message[]>(request.messages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      senderId: currentUser.id,
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages([...messages, newMsg]);
    setInput("");
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <UserAvatar name={otherUser.name} className="h-9 w-9 text-sm" />
        <div>
          <h2 className="font-display font-semibold text-foreground">{otherUser.name}</h2>
          <p className="text-xs text-muted-foreground">{request.skillOffered} ↔ {request.skillWanted}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="mb-4 h-[60vh] space-y-3 overflow-y-auto rounded-xl border border-border bg-card p-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                isMe
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}>
                {msg.text}
                <p className={`mt-1 text-[10px] ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
