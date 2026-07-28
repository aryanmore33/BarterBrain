import { useEffect, useState } from "react";
import { chatSocketService } from "@/services/chatService";
import { userInfo } from "os";
interface TypingData {
    userId: string;
    barterId: string;
}
export default function TypingIndicator() {
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    useEffect(() => {
        const handleTypingStart = ({ userId }: TypingData) => {
            setTypingUsers(prev => {
                if (prev.includes(userId)) {
                    return prev;
                }
                return [...prev, userId];
            })
        }
        const handleTypingStop = ({ userId }: TypingData) => {
            setTypingUsers(prev => prev.filter(id => id !== userId));
        }
        chatSocketService.on("typing_start", handleTypingStart);
        chatSocketService.on("typing_stop", handleTypingStop);

        return () => {
            chatSocketService.off("typing_start", handleTypingStart);
            chatSocketService.off("typing_stop", handleTypingStop)
        };
    }, []);

    if (!typingUsers.length) {
        return null;
    }
    return (
        <div className="mb-2 flex justify-start">
            <div className="rounded-2xl bg-gray-100 px-4 py-2 text-sm text-gray-500">
                Typing...
            </div>
        </div>
    );
}