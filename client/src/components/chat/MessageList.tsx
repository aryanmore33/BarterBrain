import {
    useEffect,
    useMemo,
    useRef
} from "react";

import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatSkeleton from "./ChatSkeleton";
import EmptyChat from "./EmptyChat";

import { useChat } from "@/context/ChatContext";
import { chatSocketService } from "@/services/chatService";

interface MessageListProps {

    loading: boolean;

    currentUserId: string;

    typing?: boolean;

}

export default function MessageList({

    loading,

    currentUserId,

    typing = false

}: MessageListProps) {

    const {

        messages

    } = useChat();

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        bottomRef.current?.scrollIntoView({

            behavior: "smooth"

        });

    }, [messages, typing]);

    useEffect(() => {

        messages.forEach(message => {

            if (

                message.sender_id !== currentUserId &&

                message.status !== "read"

            ) {

                chatSocketService.markRead(message.id);

            }

        });

    }, [messages, currentUserId]);

    const renderedMessages = useMemo(() => {

        return messages.map(message => (

            <MessageBubble

                key={message.id}

                message={message}

                isOwn={message.sender_id === currentUserId}

            />

        ));

    }, [messages, currentUserId]);

    if (loading) {

        return <ChatSkeleton />;

    }

    if (!messages.length) {

        return <EmptyChat />;

    }

    return (

        <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-3">

            {renderedMessages}

            {typing && <TypingIndicator />}

            <div ref={bottomRef} />

        </div>

    );

}