"use client";

import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
}

export default function LoadingOverlay({ isLoading, message }: LoadingOverlayProps) {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4 min-w-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                {message && (
                    <p className="text-sm text-gray-600 text-center">{message}</p>
                )}
            </div>
        </div>
    );
}

