import { Download } from "lucide-react";

interface ImageMessageProps {

    file_url: string;

    thumbnail_url?: string;

    file_name?: string;

}

export default function ImageMessage({

    file_url,

    thumbnail_url,

    file_name

}: ImageMessageProps) {

    const image = thumbnail_url || file_url;

    return (

        <div className="space-y-2">

            <img
                src={image}
                alt={file_name || "image"}
                className="max-h-80 w-full cursor-pointer rounded-xl object-cover"
                onClick={() => window.open(file_url, "_blank")}
            />

            <a
                href={file_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
                <Download size={15} />

                Download

            </a>

        </div>

    );

}