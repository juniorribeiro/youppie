"use client";

import { useNotificationsStore } from "@/store/notifications";
import Toast from "./Toast";

export default function ToastContainer() {
    const toasts = useNotificationsStore((state) => state.toasts);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast toast={toast} />
                </div>
            ))}
        </div>
    );
}
