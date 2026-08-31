import {
    useEffect,
    useMemo,
    useState
} from "react";

import { useChat } from "@/context/ChatContext";
import { cryptoService } from "@/services/cryptoService";

interface ReplyPreviewProps {

    messageId: string;

}

export default function ReplyPreview({

    messageId

}: ReplyPreviewProps) {

    const {

        messages

    } = useChat();

    const [preview, setPreview] = useState("");

    const repliedMessage = useMemo(() => {

        return messages.find(

            message => message.id === messageId

        );

    }, [messages, messageId]);

    useEffect(() => {

        async function decrypt() {

            if (!repliedMessage) {

                return;

            }

            if (repliedMessage.deleted_for_everyone) {

                setPreview("Message deleted");

                return;

            }

            try {

                const text = await cryptoService.decrypt(

                    repliedMessage.barter_id,

                    {

                        ciphertext: repliedMessage.ciphertext,

                        iv: repliedMessage.iv,

                        auth_tag: repliedMessage.auth_tag

                    }

                );

                setPreview(text);

            }

            catch {

                setPreview("[Unable to decrypt]");

            }

        }

        decrypt();

    }, [repliedMessage]);

    if (!repliedMessage) {

        return (

            <div className="mb-2 rounded border-l-4 border-gray-300 bg-gray-50 p-2 text-xs text-gray-500">

                Original message unavailable

            </div>

        );

    }

    return (

        <div className="mb-2 rounded border-l-4 border-blue-500 bg-blue-50 p-2">

            <p className="text-xs font-medium text-blue-700">

                {repliedMessage.sender_name}

            </p>

            <p className="line-clamp-2 text-xs text-gray-700">

                {preview}

            </p>

        </div>

    );

}