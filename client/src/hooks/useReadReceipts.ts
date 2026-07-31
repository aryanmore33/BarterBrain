import { useEffect, useRef } from "react";

import { chatSocketService } from "@/services/chatService";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";

export function useReadReceipts() {

    const {
        messages,
        updateMessage
    } = useChat();
    const { user } = useAuth();

    const deliveredMessageIdsRef = useRef<Set<string>>(new Set());

    /**
     * Mark incoming messages as delivered
     */
    useEffect(() => {

        messages.forEach(message => {

            if (
                message.sender_id !== user?.id &&
                message.status === "sent" &&
                !deliveredMessageIdsRef.current.has(message.id)
            ) {

                deliveredMessageIdsRef.current.add(message.id);

                chatSocketService.markDelivered(message.id);

            }

        });

    }, [messages, user?.id]);

    /**
     * Server says message delivered
     */
    useEffect(() => {

        const handleDelivered = ({
            messageId
        }: {
            messageId: string;
        }) => {

            const message = messages.find(
                m => m.id === messageId
            );

            if (!message) return;

            updateMessage({

                ...message,

                status: "delivered"

            });

        };

        chatSocketService.onDelivered(handleDelivered);

        return () => {

            chatSocketService.off(
                "message_delivered",
                handleDelivered
            );

        };

    }, [messages]);

    /**
     * Server says message read
     */
    useEffect(() => {

        const handleRead = ({
            messageId
        }: {
            messageId: string;
        }) => {

            const message = messages.find(
                m => m.id === messageId
            );

            if (!message) return;

            updateMessage({

                ...message,

                status: "read"

            });

        };

        chatSocketService.onRead(handleRead);

        return () => {

            chatSocketService.off(
                "message_read",
                handleRead
            );

        };

    }, [messages]);

}
