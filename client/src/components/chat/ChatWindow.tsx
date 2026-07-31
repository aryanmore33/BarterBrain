import { useEffect } from "react";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

import { useChat } from "@/context/ChatContext";
import { chatSocketService } from "@/services/chatService";

import { useHeartbeat } from "@/hooks/useHeartbeat";
import { useSyncMessages } from "@/hooks/useSyncMessages";
import { useReadReceipts } from "@/hooks/useReadReceipts";

interface ChatWindowProps {

    barterId: string;

    currentUserId: string;

    receiverId: string;

    receiverName: string;

    receiverAvatar?: string;

}

export default function ChatWindow({

    barterId,

    currentUserId,

    receiverId,

    receiverName,

    receiverAvatar

}: ChatWindowProps) {

    const {

        loading,

        typing,

        openChat,

        closeChat

    } = useChat();

    useHeartbeat();

    useSyncMessages();

    useReadReceipts();

    useEffect(() => {

        let mounted = true;

        async function initialize() {

            await openChat(barterId);
            if (mounted) chatSocketService.joinChat(barterId);

        }

        initialize();

        return () => {

            mounted = false;

            chatSocketService.leaveChat(barterId);

            closeChat();

        };

    }, [barterId, closeChat, openChat]);

    return (

        <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-black">

            <ChatHeader

                receiverId={receiverId}

                receiverName={receiverName}

                receiverAvatar={receiverAvatar}

                typing={typing}

                barterId={barterId}

            />

            <MessageList

                loading={loading}

                currentUserId={currentUserId}

                typing={typing}

            />

            <MessageInput

                barterId={barterId}

            />

        </div>

    );

}
