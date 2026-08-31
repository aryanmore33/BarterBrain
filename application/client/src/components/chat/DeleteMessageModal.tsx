interface DeleteMessageModalProps {

    open: boolean;

    onClose: () => void;

    onConfirm: () => void;

}

export default function DeleteMessageModal({

    open,

    onClose,

    onConfirm

}: DeleteMessageModalProps) {

    if (!open) {

        return null;

    }

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">

                <h2 className="text-lg font-semibold">

                    Delete Message

                </h2>

                <p className="mt-3 text-sm text-gray-600">

                    This message will be deleted for everyone.

                    This action cannot be undone.

                </p>

                <div className="mt-6 flex justify-end gap-3">

                    <button

                        onClick={onClose}

                        className="rounded-lg border px-4 py-2"

                    >

                        Cancel

                    </button>

                    <button

                        onClick={() => {

                            onConfirm();

                            onClose();

                        }}

                        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"

                    >

                        Delete

                    </button>

                </div>

            </div>

        </div>

    );

}