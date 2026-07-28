import { useEffect, useRef } from "react";

import { chatSocketService } from "@/services/chatService";
import { useChat } from "@/context/ChatContext";

export function useSyncMessages() {

    const {
        barterId,
        messages,
        addMessage
    } = useChat();

    const messagesRef = useRef(messages);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {

        if (!barterId) return;

        function sync() {

            const lastMessage = messagesRef.current.at(-1);

            chatSocketService.syncMessages(
                barterId,
                lastMessage?.id
            );

        }

        function handleSync(newMessages: any[]) {

            newMessages.forEach(addMessage);

        }

        chatSocketService.on(
            "sync_messages",
            handleSync
        );

        window.addEventListener(
            "focus",
            sync
        );

        sync();

        return () => {

            window.removeEventListener(
                "focus",
                sync
            );

            chatSocketService.off(
                "sync_messages",
                handleSync
            );

        };

    }, [barterId, addMessage]);

}