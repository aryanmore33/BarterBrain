import { useEffect, useRef, useState } from "react";
import {
    Pause,
    Play
} from "lucide-react";

interface AudioMessageProps {

    url: string;

    duration?: number | null;

}

export default function AudioMessage({

    url,
    duration

}: AudioMessageProps) {

    const audioRef = useRef<HTMLAudioElement>(null);

    const [playing, setPlaying] = useState(false);

    const [current, setCurrent] = useState(0);

    useEffect(() => {

        const audio = audioRef.current;

        if (!audio) return;

        const update = () => {

            setCurrent(audio.currentTime);

        };

        const ended = () => {

            setPlaying(false);

            setCurrent(0);

        };

        audio.addEventListener("timeupdate", update);

        audio.addEventListener("ended", ended);

        return () => {

            audio.removeEventListener("timeupdate", update);

            audio.removeEventListener("ended", ended);

        };

    }, []);

    function toggle() {

        const audio = audioRef.current;

        if (!audio) return;

        if (playing) {

            audio.pause();

            setPlaying(false);

        } else {

            audio.play();

            setPlaying(true);

        }

    }

    function seek(e: React.ChangeEvent<HTMLInputElement>) {

        const audio = audioRef.current;

        if (!audio) return;

        audio.currentTime = Number(e.target.value);

        setCurrent(audio.currentTime);

    }

    return (

        <div className="flex w-72 items-center gap-3 rounded-xl bg-gray-100 p-3">

            <button

                onClick={toggle}

                className="rounded-full bg-blue-600 p-2 text-white"

            >

                {playing ?

                    <Pause size={18} />

                    :

                    <Play size={18} />

                }

            </button>

            <input

                type="range"

                min={0}

                max={duration || audioRef.current?.duration || 0}

                value={current}

                onChange={seek}

                className="flex-1"

            />

            <span className="text-xs text-gray-500">

                {Math.floor(current)}s

            </span>

            <audio

                ref={audioRef}

                src={url}

                preload="metadata"

            />

        </div>

    );

}