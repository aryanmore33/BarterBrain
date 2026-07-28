import { useRef } from "react";

import {

    Paperclip

} from "lucide-react";

import { useAttachments } from "@/hooks/useAttachments";
import { chatSocketService } from "@/services/chatService";

interface AttachmentPickerProps {

    messageId: string;

}

export default function AttachmentPicker({

    messageId

}: AttachmentPickerProps) {

    const inputRef = useRef<HTMLInputElement>(null);
    const { upload } = useAttachments();

    async function handleFiles(

        e: React.ChangeEvent<HTMLInputElement>

    ) {

        const file = e.target.files?.[0];

        if (!file) {

            return;

        }

        try {

            const uploaded = await upload(file);

            chatSocketService.sendAttachment({

                messageId,

                file_url: uploaded.file_url,

                thumbnail_url: uploaded.thumbnail_url,

                file_name: uploaded.file_name,

                mime_type: uploaded.mime_type,

                file_size: uploaded.file_size,

                width: uploaded.width,

                height: uploaded.height,

                duration: uploaded.duration

            });

        }

        catch (err) {

            console.error(err);

        }

        finally {

            e.target.value = "";

        }

    }

    return (

        <>

            <input

                ref={inputRef}

                hidden

                type="file"

                onChange={handleFiles}

                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip,.txt"

            />

            <button

                type="button"

                onClick={() => inputRef.current?.click()}

                className="rounded-full p-2 hover:bg-gray-100"

            >

                <Paperclip size={20} />

            </button>

        </>

    );

}