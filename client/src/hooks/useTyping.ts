import { useEffect, useRef } from "react";

import { chatSocketService } from "@/services/chatService";

interface UseTypingOptions {
    barterId: string;
    value: string;
}

export function useTyping({
    barterId,
    value
}: UseTypingOptions) {

    const timeoutRef = useRef<number>();

    useEffect(() => {

        if (!barterId) return;

        if (value.trim().length > 0) {

            chatSocketService.typingStart(barterId);

        }

        window.clearTimeout(timeoutRef.current);

        timeoutRef.current = window.setTimeout(() => {

            chatSocketService.typingStop(barterId);

        }, 1200);

        return () => {

            window.clearTimeout(timeoutRef.current);

        };

    }, [value, barterId]);

    useEffect(() => {

        return () => {

            if (barterId) {

                chatSocketService.typingStop(barterId);

            }

        };

    }, [barterId]);

}