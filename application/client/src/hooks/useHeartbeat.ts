import { useEffect } from "react";
import { chatSocketService } from "@/services/chatService";
export function useHeartbeat() {
    useEffect(() => {
        const interval = window.setInterval(() => { 
            chatSocketService.heartbeat();
        }, 3000);
        return () => {
            clearInterval(interval);
        }
    }, []);
}