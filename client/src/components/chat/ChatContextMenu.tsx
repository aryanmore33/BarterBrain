import {
    Copy,
    Pencil,
    Reply,
    Trash2
} from "lucide-react";

interface ChatContextMenuProps {

    open: boolean;

    x: number;

    y: number;

    isOwn: boolean;

    onReply: () => void;

    onEdit: () => void;

    onDelete: () => void;

    onClose: () => void;

    message: string;

}

export default function ChatContextMenu({

    open,

    x,

    y,

    isOwn,

    onReply,

    onEdit,

    onDelete,

    onClose,

    message

}: ChatContextMenuProps) {

    if (!open) return null;

    async function copyText() {

        await navigator.clipboard.writeText(message);

        onClose();

    }

    return (

        <>

            <div

                className="fixed inset-0 z-40"

                onClick={onClose}

            />

            <div

                className="fixed z-50 w-52 rounded-xl border bg-white shadow-xl"

                style={{

                    left: x,

                    top: y

                }}

            >

                <button

                    onClick={() => {

                        onReply();

                        onClose();

                    }}

                    className="flex w-full items-center gap-3 px-4 py-3 hover:bg-gray-100"

                >

                    <Reply size={18} />

                    Reply

                </button>

                <button

                    onClick={copyText}

                    className="flex w-full items-center gap-3 px-4 py-3 hover:bg-gray-100"

                >

                    <Copy size={18} />

                    Copy

                </button>

                {isOwn && (

                    <>

                        <button

                            onClick={() => {

                                onEdit();

                                onClose();

                            }}

                            className="flex w-full items-center gap-3 px-4 py-3 hover:bg-gray-100"

                        >

                            <Pencil size={18} />

                            Edit

                        </button>

                        <button

                            onClick={() => {

                                onDelete();

                                onClose();

                            }}

                            className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50"

                        >

                            <Trash2 size={18} />

                            Delete

                        </button>

                    </>

                )}

            </div>

        </>

    );

}