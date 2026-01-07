"use client";

import { X, AlertTriangle } from "lucide-react";
import { Button } from "@repo/ui";

interface LimitWarningProps {
    isOpen: boolean;
    onClose: () => void;
    current: number;
    limit: number;
    onUpgrade: () => void;
}

export default function LimitWarning({ isOpen, onClose, current, limit, onUpgrade }: LimitWarningProps) {
    if (!isOpen) return null;

    const percentage = (current / limit) * 100;
    const isNearLimit = percentage >= 80;

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-md animate-slide-up">
            <div className="bg-white rounded-lg shadow-xl border-l-4 border-warning-500 p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                            {isNearLimit ? "Limite Próximo" : "Limite Atingido"}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Você está usando {current} de {limit} {limit === 1 ? "quiz" : "quizzes"} disponíveis 
                            ({Math.round(percentage)}%).
                            {isNearLimit && " Considere fazer upgrade para continuar criando quizzes."}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div
                                className={`h-2 rounded-full transition-all ${
                                    percentage >= 100
                                        ? "bg-danger-600"
                                        : percentage >= 80
                                        ? "bg-warning-600"
                                        : "bg-success-600"
                                }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="primary"
                                onClick={onUpgrade}
                                className="flex-1"
                            >
                                Fazer Upgrade
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onClose}
                            >
                                Fechar
                            </Button>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

