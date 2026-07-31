import { ArrowLeft, Video } from "lucide-react";

import { usePresence } from "@/hooks/usePresence";
import { useNavigate } from "react-router-dom";

interface ChatHeaderProps {

    receiverId: string;

    receiverName: string;

    receiverAvatar?: string;

    typing?: boolean;
    barterId: string;

}

export default function ChatHeader({

    receiverId,

    receiverName,

    receiverAvatar,

    typing = false,
    barterId

}: ChatHeaderProps) {

    const {

        online,

        lastSeen

    } = usePresence(receiverId);
    const navigate = useNavigate();

    function getSubtitle() {

        if (typing) {

            return "Typing...";

        }

        if (online) {

            return "Online";

        }

        if (lastSeen) {

            return `Last seen ${new Date(lastSeen).toLocaleString()}`;

        }

        return "Offline";

    }

    return (

        <div className="flex items-center justify-between border-b bg-card px-4 py-3">

            <div className="flex items-center gap-3">
                <button onClick={() => navigate("/connections")} className="rounded-full p-2 hover:bg-muted" aria-label="Back to connections"><ArrowLeft size={20} /></button>

                {receiverAvatar ? (

                    <img

                        src={receiverAvatar}

                        alt={receiverName}

                        className="h-11 w-11 rounded-full object-cover"

                    />

                ) : (

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-300 font-semibold">

                        {receiverName.charAt(0).toUpperCase()}

                    </div>

                )}

                <div>

                    <h2 className="font-semibold">

                        {receiverName}

                    </h2>

                    <p className="text-xs text-gray-500">

                        {getSubtitle()}

                    </p>

                </div>

            </div>

            <div className="flex gap-2">

                <button
                    onClick={() => navigate(`/connections/${barterId}/call`)}
                    className="rounded-full p-2 text-primary hover:bg-muted"
                    aria-label="Start video call"

                >

                    <Video size={20} />

                </button>

            </div>

        </div>

    );

}
