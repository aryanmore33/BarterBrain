import {

    useEffect,

    useState

} from "react";

import { useParams } from "react-router-dom";

import ChatWindow from "@/components/chat/ChatWindow";

import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";

import apiClient from "@/services/apiClient";

interface ChatInfo {

    barterId: string;

    receiver: {

        id: string;

        name: string;

        avatar?: string;

    };

}

export default function ChatPage() {

    const {

        barterId

    } = useParams();

    const {

        user

    } = useAuth();

    const {

        loading

    } = useChat();

    const [

        chatInfo,

        setChatInfo

    ] = useState<ChatInfo | null>(null);

    useEffect(() => {

        if (!barterId) {

            return;

        }

        loadChat();

    }, [barterId]);

    async function loadChat() {

        try {

            const response = await apiClient.get(

                `/api/chat/${barterId}`

            );

            setChatInfo(response.data);

        }

        catch (err) {

            console.error(err);

        }

    }

    if (!barterId) {

        return (

            <div className="flex h-screen items-center justify-center">

                Invalid chat.

            </div>

        );

    }

    if (loading || !chatInfo || !user) {

        return (

            <div className="flex h-screen items-center justify-center">

                Loading...

            </div>

        );

    }

    return (

        <div className="mx-auto flex h-screen max-w-6xl">

            <div className="flex-1 overflow-hidden p-5">

                <ChatWindow

                    barterId={chatInfo.barterId}

                    currentUserId={user.id}

                    receiverName={chatInfo.receiver.name}

                    receiverAvatar={chatInfo.receiver.avatar}

                    receiverId={chatInfo.receiver.id}

                />

            </div>

        </div>

    );

}