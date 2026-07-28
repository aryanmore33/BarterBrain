export default function ChatSkeleton() {

    return (

        <div className="flex flex-col gap-4 p-4">

            {Array.from({ length: 12 }).map((_, index) => (

                <div
                    key={index}
                    className={`flex ${
                        index % 2 === 0
                            ? "justify-start"
                            : "justify-end"
                    }`}
                >

                    <div
                        className={`animate-pulse rounded-2xl ${
                            index % 2 === 0
                                ? "bg-gray-200"
                                : "bg-green-100"
                        } h-14 w-56`}
                    />

                </div>

            ))}

        </div>

    );

}