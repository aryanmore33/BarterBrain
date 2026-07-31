import { useState } from "react";
import { Send } from "lucide-react";
import { chatSocketService } from "@/services/chatService";
import { cryptoService } from "@/services/cryptoService";
import { useTyping } from "@/hooks/useTyping"
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import type { Message } from "@/services/api";
import { toast } from "@/components/ui/use-toast";

interface MessageInputProps { barterId: string }
export default function MessageInput({ barterId }: MessageInputProps) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const { addMessage } = useChat();
    const { user } = useAuth();
    useTyping({
        barterId,
        value: message
    });
    const sendMessage = async () => {
        const text = message.trim();
        if (!text) return;
        try {
            setSending(true);
            const encrypted = await cryptoService.encrypt(barterId, text);
            const payload = {
                barterId,
                ciphertext: encrypted.ciphertext,
                iv: encrypted.iv,
                auth_tag: encrypted.auth_tag,
                message_type: "text" as const,
                reply_to_message_id: null,
                tempId: crypto.randomUUID()
            }
            const optimistic: Message = {
                id: payload.tempId,
                barter_id: barterId,
                sender_id: user?.id ?? "",
                ciphertext: payload.ciphertext,
                iv: payload.iv,
                auth_tag: payload.auth_tag,
                message_type: "text",
                status: "sent",
                edited: false,
                deleted_for_everyone: false,
                created_at: new Date().toISOString()
            };
            addMessage(optimistic);
            chatSocketService.sendMessage(payload);
            setMessage("");
            //             const { upload } = useAttachments();

            //             const file = e.target.files?.[0];

            //             const uploaded = await upload(file);

            //             chatSocketService.sendAttachment({

            //                 barterId,

            //                 ...

            // });
        } catch (err) {
            console.error(err);
            toast({
                variant: "destructive",
                title: "Message was not sent",
                description: err instanceof Error ? err.message : "Encryption or socket connection failed."
            });
        } finally {
            setSending(false);
        }
    }
    return (
        <div className="border-t bg-indigo-950 p-3">
            <div className="flex items-end gap-3">
                <textarea
                    rows={1}
                    value={message}
                    placeholder="Type a message..."
                    className="max-h-36 flex-1 resize-none rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (
                            e.key === "Enter" &&
                            !e.shiftKey
                        ) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                />
                <button
                    onClick={sendMessage}
                    disabled={sending}
                    className="rounded-full bg-blue-600 p-3 text-white transition hover:bg-blue-700"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
