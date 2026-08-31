import { useState } from "react";

import {

    Maximize2,

    Play

} from "lucide-react";

interface VideoMessageProps {

    url: string;

    thumbnail?: string | null;

}

export default function VideoMessage({

    url,

    thumbnail

}: VideoMessageProps) {

    const [playing, setPlaying] = useState(false);

    return (

        <div className="relative w-80 overflow-hidden rounded-xl bg-black">

            {

                playing ?

                    (

                        <video

                            src={url}

                            controls

                            autoPlay

                            className="w-full"

                        />

                    )

                    :

                    (

                        <>

                            <img

                                src={thumbnail || "/video-placeholder.png"}

                                className="w-full"

                            />

                            <button

                                onClick={() => setPlaying(true)}

                                className="absolute inset-0 flex items-center justify-center"

                            >

                                <div className="rounded-full bg-black/60 p-4">

                                    <Play

                                        className="text-white"

                                        size={30}

                                    />

                                </div>

                            </button>

                        </>

                    )

            }

            <a

                href={url}

                target="_blank"

                rel="noreferrer"

                className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white"

            >

                <Maximize2 size={16} />

            </a>

        </div>

    );

}