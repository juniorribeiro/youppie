"use client";

import { useEffect } from "react";
import { X, Info, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { useNotificationsStore, Toast as ToastType } from "@/store/notifications";

interface ToastProps {
    toast: ToastType;
}

export default function Toast({ toast }: ToastProps) {
    const removeToast = useNotificationsStore((state) => state.removeToast);
    const duration = toast.duration || 5000;

    useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(toast.id);
        }, duration);

        return () => clearTimeout(timer);
    }, [toast.id, duration, removeToast]);

    const getToastStyles = () => {
        switch (toast.type) {
            case 'SUCCESS':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'WARNING':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'ERROR':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'INFO':
            default:
                return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'SUCCESS':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'WARNING':
                return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
            case 'ERROR':
                return <AlertCircle className="h-5 w-5 text-red-600" />;
            case 'INFO':
            default:
                return <Info className="h-5 w-5 text-blue-600" />;
        }
    };

    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[320px] max-w-[420px] animate-slide-in-right ${getToastStyles()}`}
            role="alert"
        >
            <div className="flex-shrink-0 mt-0.5">
                {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
                {toast.title && (
                    <h4 className="font-semibold text-sm mb-1">{toast.title}</h4>
                )}
                <p className="text-sm">{toast.message}</p>
            </div>
            <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fechar notificação"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
