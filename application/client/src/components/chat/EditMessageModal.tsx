import {
    useEffect,
    useState
} from "react";

import { cryptoService } from "@/services/cryptoService";
import { chatSocketService } from "@/services/chatService";

interface EditMessageModalProps {

    open: boolean;

    barterId: string;

    messageId: string;

    initialText: string;

    onClose: () => void;

}

export default function EditMessageModal({

    open,

    barterId,

    messageId,

    initialText,

    onClose

}: EditMessageModalProps) {

    const [text, setText] = useState("");

    const [saving, setSaving] = useState(false);

    useEffect(() => {

        setText(initialText);

    }, [initialText]);

    if (!open) {

        return null;

    }

    async function save() {

        if (!text.trim()) {

            return;

        }

        setSaving(true);

        try {

            const encrypted = await cryptoService.encrypt(

                barterId,

                text.trim()

            );

            chatSocketService.editMessage({

                messageId,

                ciphertext: encrypted.ciphertext,

                iv: encrypted.iv,

                auth_tag: encrypted.auth_tag

            });

            onClose();

        }

        finally {

            setSaving(false);

        }

    }

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

            <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">

                <h2 className="mb-4 text-lg font-semibold">

                    Edit Message

                </h2>

                <textarea

                    rows={4}

                    value={text}

                    onChange={(e) => setText(e.target.value)}

                    className="w-full rounded-lg border p-3 outline-none"

                />

                <div className="mt-5 flex justify-end gap-3">

                    <button

                        onClick={onClose}

                        className="rounded-lg border px-4 py-2"

                    >

                        Cancel

                    </button>

                    <button

                        disabled={saving}

                        onClick={save}

                        className="rounded-lg bg-blue-600 px-4 py-2 text-white"

                    >

                        {saving ? "Saving..." : "Save"}

                    </button>

                </div>

            </div>

        </div>

    );

}