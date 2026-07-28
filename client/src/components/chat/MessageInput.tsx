import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { chatSocketService } from "@/services/chatService";
import { cryptoService } from "@/services/cryptoService";
import { useTyping } from "@/hooks/useTyping"

interface MessageInputProps { barterId: string }
export default function MessageInput({ barterId }: MessageInputProps) {
    const [message, setMessage] = useState("");
    useTyping({
        barterId,
        value: message
    });
    const sendMessage = async () => {
        const text = message.trim();
        if (!text) return;
        try {
            const encrypted = await cryptoService.encrypt(barterId, text);
            const payload = {
                barterId,
                ciphertext: encrypted.ciphertext,
                iv: encrypted.iv,
                auth_tag: encrypted.auth_tag,
                message_type: "text" as const,
                reply_to_message_id: null
            }
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
        }
    }
    return (
        <div className="border-t bg-white p-3">
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
                    className="rounded-full bg-blue-600 p-3 text-white transition hover:bg-blue-700"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}