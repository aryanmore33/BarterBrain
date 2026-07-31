import { useEffect, useMemo, useState } from "react";
import {
    Check,
    CheckCheck,
    Pencil
} from "lucide-react";

import { Message } from "@/services/api";
import { cryptoService } from "@/services/cryptoService";
import { chatSocketService } from "@/services/chatService";

import ReplyPreview from "./ReplyPreview";
import ImageMessage from "./ImageMessage";
import AudioMessage from "./AudioMessage";
import VideoMessage from "./VideoMessage";
import FileMessage from "./FileMessage";
import ChatContextMenu from "./ChatContextMenu";
import EditMessageModal from "./EditMessageModal";
import DeleteMessageModal from "./DeleteMessageModal";

interface MessageBubbleProps {
    message: Message;
    isOwn?: boolean;
}

export default function MessageBubble({
    message,
    isOwn = false
}: MessageBubbleProps) {

    const [text, setText] = useState("");

    const [menuOpen, setMenuOpen] = useState(false);

    const [editing, setEditing] = useState(false);

    const [deleting, setDeleting] = useState(false);

    const [menuPosition, setMenuPosition] = useState({
        x: 0,
        y: 0
    });

    useEffect(() => {

        let mounted = true;

        async function decrypt() {

            if (message.deleted_for_everyone) {

                setText("");

                return;

            }

            try {

                const decrypted = await cryptoService.decrypt(
                    message.barter_id,
                    {
                        ciphertext: message.ciphertext,
                        iv: message.iv,
                        auth_tag: message.auth_tag
                    }
                );

                if (mounted) {

                    setText(decrypted);

                }

            } catch (err) {

                console.error(err);

                if (mounted) {

                    setText("[Unable to decrypt]");

                }

            }

        }

        decrypt();

        return () => {

            mounted = false;

        };

    }, [message]);

    const time = useMemo(() => {

        return new Date(message.created_at).toLocaleTimeString([], {

            hour: "2-digit",

            minute: "2-digit"

        });

    }, [message.created_at]);

    function handleContextMenu(
        e: React.MouseEvent<HTMLDivElement>
    ) {

        e.preventDefault();

        setMenuPosition({

            x: e.clientX,

            y: e.clientY

        });

        setMenuOpen(true);

    }

    function deleteMessage() {

        chatSocketService.deleteMessage(message.id);

    }

    function renderStatus() {

        if (!isOwn) {

            return null;

        }

        switch (message.status) {

            case "read":

                return (

                    <CheckCheck
                        size={15}
                        className="text-blue-500"
                    />

                );

            case "delivered":

                return (

                    <CheckCheck
                        size={15}
                        className="text-gray-500"
                    />

                );

            default:

                return (

                    <Check
                        size={15}
                        className="text-gray-500"
                    />

                );

        }

    }

    const attachment = message.attachments?.[0];

    return (

        <>

            <div

                className={`mb-2 flex ${isOwn
                        ? "justify-end"
                        : "justify-start"
                    }`}

            >

                <div

                    onContextMenu={handleContextMenu}

                    className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${isOwn
                            ? "bg-green-100"
                            : "bg-gray-100"
                        }`}

                >

                    {message.reply_to_message_id && (

                        <ReplyPreview

                            messageId={message.reply_to_message_id}

                        />

                    )}

                    {message.deleted_for_everyone ? (

                        <p className="italic text-gray-700">

                            This message was deleted.

                        </p>

                    ) : (

                        <>

                            {message.message_type === "text" && (

                                <p className="whitespace-pre-wrap break-words text-black">

                                    {text}

                                </p>

                            )}

                            {message.message_type === "image" && attachment && (

                                <ImageMessage

                                    file_url={attachment.file_url}

                                    thumbnail_url={attachment.thumbnail_url}

                                    file_name={attachment.file_name}

                                />

                            )}

                            {message.message_type === "audio" && attachment && (

                                <AudioMessage

                                    url={attachment.file_url}

                                    duration={attachment.duration}

                                />

                            )}

                            {message.message_type === "video" && attachment && (

                                <VideoMessage

                                    url={attachment.file_url}

                                    thumbnail={attachment.thumbnail_url}

                                />

                            )}

                            {message.message_type === "file" && attachment && (

                                <FileMessage

                                    file_url={attachment.file_url}

                                    file_name={attachment.file_name}

                                    file_size={attachment.file_size}

                                />

                            )}

                            <div className="mt-2 flex items-center justify-end gap-1 text-xs text-gray-500">

                                {message.edited && (

                                    <>

                                        <Pencil size={12} />

                                        <span>

                                            Edited

                                        </span>

                                    </>

                                )}

                                <span>

                                    {time}

                                </span>

                                {renderStatus()}

                            </div>

                        </>

                    )}

                </div>

            </div>

            <ChatContextMenu

                open={menuOpen}

                x={menuPosition.x}

                y={menuPosition.y}

                isOwn={isOwn}

                message={text}

                onClose={() => setMenuOpen(false)}

                onReply={() => {

                    // Will connect to ReplyContext later

                }}

                onEdit={() => {

                    setEditing(true);

                }}

                onDelete={() => {

                    setDeleting(true);

                }}

            />

            <EditMessageModal

                open={editing}

                barterId={message.barter_id}

                messageId={message.id}

                initialText={text}

                onClose={() => {

                    setEditing(false);

                }}

            />

            <DeleteMessageModal

                open={deleting}

                onClose={() => {

                    setDeleting(false);

                }}

                onConfirm={deleteMessage}

            />

        </>

    );

}