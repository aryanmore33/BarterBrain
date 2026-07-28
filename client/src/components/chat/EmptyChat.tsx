import { MessageCircle } from "lucide-react";

interface EmptyChatProps {

    name?: string;

}

export default function EmptyChat({

    name

}: EmptyChatProps) {

    return (
        <div className="flex h-full flex-col items-center justify-center text-center">

            <div className="rounded-full bg-blue-100 p-6">

                <MessageCircle

                    size={42}

                    className="text-blue-600"

                />

            </div>

            <h2 className="mt-5 text-xl font-semibold">

                No messages yet

            </h2>

            <p className="mt-2 max-w-sm text-sm text-gray-500">

                {name
                    ? `Start your conversation with ${name}.`
                    : "Start chatting to exchange skills securely."
                }

            </p>

        </div>

    );

}