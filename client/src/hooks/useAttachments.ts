import { useState } from "react";

import apiClient from "@/services/apiClient";

interface UploadResult {

    file_url: string;

    thumbnail_url?: string;

    file_name: string;

    mime_type: string;

    file_size: number;

    width?: number;

    height?: number;

    duration?: number;

}

export function useAttachments() {

    const [uploading, setUploading] = useState(false);

    async function upload(file: File): Promise<UploadResult> {

        setUploading(true);

        try {

            const formData = new FormData();

            formData.append("file", file);

            const response = await apiClient.post(

                "/api/upload",

                formData,

                {

                    headers: {

                        "Content-Type": "multipart/form-data"

                    }

                }

            );

            return response.data;

        }

        finally {

            setUploading(false);

        }

    }

    return {

        uploading,

        upload

    };

}