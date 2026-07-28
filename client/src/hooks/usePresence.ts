import { useEffect, useState } from "react";

import { chatSocketService } from "@/services/chatService";

interface PresenceState {

    online: boolean;

    lastSeen?: string;

}

export function usePresence(userId: string) {

    const [presence, setPresence] = useState<PresenceState>({
        online: false
    });

    useEffect(() => {

        function handleOnline(data: any) {

            if (data.userId !== userId) return;

            setPresence({

                online: true

            });

        }

        function handleOffline(data: any) {

            if (data.userId !== userId) return;

            setPresence({

                online: false,

                lastSeen: new Date().toISOString()

            });

        }

        chatSocketService.on("user_online", handleOnline);

        chatSocketService.on("user_offline", handleOffline);

        return () => {

            chatSocketService.off("user_online", handleOnline);

            chatSocketService.off("user_offline", handleOffline);

        };

    }, [userId]);

    return presence;

}