import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState
} from "react";

import { chatService, Message } from "@/services/api";
import { keyService } from "@/services/keyService";

interface ChatContextType {

    barterId: string | null;

    loading: boolean;

    typing: boolean;

    messages: Message[];

    replyingTo: Message | null;

    editingMessage: Message | null;

    openChat: (barterId: string) => Promise<void>;

    closeChat: () => void;

    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;

    addMessage: (message: Message) => void;

    updateMessage: (message: Message) => void;

    removeMessage: (messageId: string) => void;

    replaceTempMessage: (
        tempId: string,
        message: Message
    ) => void;

    markDelivered: (
        messageId: string
    ) => void;

    markRead: (
        messageId: string
    ) => void;

    startReply: (
        message: Message
    ) => void;

    cancelReply: () => void;

    startEdit: (
        message: Message
    ) => void;

    cancelEdit: () => void;

    setTyping: React.Dispatch<React.SetStateAction<boolean>>;

}

const ChatContext =
createContext<ChatContextType | undefined>(
    undefined
);

export function ChatProvider({

    children

}: {

    children: React.ReactNode;

}) {

    const [barterId, setBarterId] =
    useState<string | null>(null);

    const [messages, setMessages] =
    useState<Message[]>([]);

    const [loading, setLoading] =
    useState(false);

    const [typing, setTyping] =
    useState(false);

    const [replyingTo, setReplyingTo] =
    useState<Message | null>(null);

    const [editingMessage, setEditingMessage] =
    useState<Message | null>(null);

    const openChat = useCallback(

        async (id: string) => {

            setLoading(true);

            try {

                await keyService.getChatKey(id);

                const response: any =
                    await chatService.getMessages(id);

                setBarterId(id);

                setMessages(response.data ?? []);

            }

            finally {

                setLoading(false);

            }

        },

        []

    );

    const closeChat = useCallback(() => {

        setBarterId(null);

        setMessages([]);

        setTyping(false);

        setReplyingTo(null);

        setEditingMessage(null);

    }, []);

    const addMessage = useCallback(

        (message: Message) => {

            setMessages(prev => {

                if (
                    prev.some(
                        m => m.id === message.id
                    )
                ) {

                    return prev;

                }

                return [

                    ...prev,

                    message

                ];

            });

        },

        []

    );

    const updateMessage = useCallback(

        (message: Message) => {

            setMessages(prev =>

                prev.map(m =>

                    m.id === message.id

                        ? message

                        : m

                )

            );

        },

        []

    );

    const removeMessage = useCallback(

        (messageId: string) => {

            setMessages(prev =>

                prev.filter(

                    m =>

                        m.id !== messageId

                )

            );

        },

        []

    );

    /*
        Message ACK
    */

    const replaceTempMessage =
    useCallback(

        (

            tempId: string,

            message: Message

        ) => {

            setMessages(prev =>

                prev.map(m =>

                    m.id === tempId

                        ? message

                        : m

                )

            );

        },

        []

    );

    /*
        Delivered
    */

    const markDelivered =
    useCallback(

        (

            messageId: string

        ) => {

            setMessages(prev =>

                prev.map(m =>

                    m.id === messageId

                        ? {

                            ...m,

                            status: "delivered"

                        }

                        : m

                )

            );

        },

        []

    );

    /*
        Read
    */

    const markRead =
    useCallback(

        (

            messageId: string

        ) => {

            setMessages(prev =>

                prev.map(m =>

                    m.id === messageId

                        ? {

                            ...m,

                            status: "read"

                        }

                        : m

                )

            );

        },

        []

    );

    /*
        Reply
    */

    const startReply =
    useCallback(

        (

            message: Message

        ) => {

            setReplyingTo(message);

        },

        []

    );

    const cancelReply =
    useCallback(() => {

        setReplyingTo(null);

    }, []);

    /*
        Edit
    */

    const startEdit =
    useCallback(

        (

            message: Message

        ) => {

            setEditingMessage(message);

        },

        []

    );

    const cancelEdit =
    useCallback(() => {

        setEditingMessage(null);

    }, []);

    const value =
    useMemo(

        () => ({

            barterId,

            loading,

            typing,

            messages,

            replyingTo,

            editingMessage,

            openChat,

            closeChat,

            setMessages,

            addMessage,

            updateMessage,

            removeMessage,

            replaceTempMessage,

            markDelivered,

            markRead,

            startReply,

            cancelReply,

            startEdit,

            cancelEdit,

            setTyping

        }),

        [

            barterId,

            loading,

            typing,

            messages,

            replyingTo,

            editingMessage

        ]

    );

    return (

        <ChatContext.Provider
            value={value}
        >

            {children}

        </ChatContext.Provider>

    );

}

export function useChat() {

    const context =
    useContext(ChatContext);

    if (!context) {

        throw new Error(

            "useChat must be used inside ChatProvider"

        );

    }

    return context;

}