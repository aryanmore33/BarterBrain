import {

    File,

    Download

} from "lucide-react";

interface FileMessageProps {

    file_url: string;

    file_name?: string;

    file_size?: number;

}

export default function FileMessage({

    file_url,

    file_name,

    file_size

}: FileMessageProps) {

    function formatBytes(bytes?: number) {

        if (!bytes) return "";

        const units = ["B", "KB", "MB", "GB"];

        let i = 0;

        let value = bytes;

        while (value >= 1024 && i < units.length - 1) {

            value /= 1024;

            i++;

        }

        return `${value.toFixed(1)} ${units[i]}`;

    }

    return (

        <a

            href={file_url}

            target="_blank"

            rel="noreferrer"

            className="flex items-center gap-3 rounded-xl border bg-gray-50 p-3 hover:bg-gray-100"

        >

            <File

                size={38}

                className="text-blue-600"

            />

            <div className="flex-1">

                <p className="font-medium">

                    {file_name || "Attachment"}

                </p>

                <p className="text-sm text-gray-500">

                    {formatBytes(file_size)}

                </p>

            </div>

            <Download size={18} />

        </a>

    );

}