import {

    useEffect,

    useState

} from "react";

import { useParams } from "react-router-dom";

import ChatWindow from "@/components/chat/ChatWindow";

import { useAuth } from "@/context/AuthContext";

import { barterService, type BarterRequest } from "@/services/api";

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

    const [

        chatInfo,

        setChatInfo

    ] = useState<ChatInfo | null>(null);

    useEffect(() => {

        if (!barterId) {

            return;

        }

        loadChat();

    }, [barterId, user]);

    async function loadChat() {

        try {

            const response: any = await barterService.getRequests();
            const requests: BarterRequest[] = [
                ...(response.data?.incoming ?? []),
                ...(response.data?.outgoing ?? [])
            ];
            const barter = requests.find(request => request.id === barterId && request.status === "accepted");
            if (!barter || !user) return;
            const receiver = barter.requester_id === user.id ? barter.receiver : barter.requester;
            if (!receiver) return;
            setChatInfo({
                barterId,
                receiver: { id: receiver.id, name: receiver.name, avatar: receiver.avatar }
            });

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

    if (!chatInfo || !user) {

        return (

            <div className="flex h-screen items-center justify-center">

                Loading...

            </div>

        );

    }

    return (

        <div className="mx-auto flex h-[calc(100vh-10rem)] max-w-5xl">

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
