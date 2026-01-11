"use client";

import { MessageSquare, User, Shield, Paperclip } from "lucide-react";
import { useAuthStore } from "@/store/auth";

interface TicketMessage {
    id: string;
    sender_type: string;
    sender_id: string;
    message: string;
    attachment_url?: string | null;
    created_at: string;
}

interface TicketMessagesProps {
    messages: TicketMessage[];
}

export default function TicketMessages({ messages }: TicketMessagesProps) {
    const currentUser = useAuthStore((state) => state.user);

    return (
        <div className="space-y-4">
            {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Nenhuma mensagem ainda</p>
                </div>
            ) : (
                messages.map((message) => {
                    const isUser = message.sender_type === "USER";
                    const isCurrentUser = isUser && message.sender_id === currentUser?.id;

                    return (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${isUser ? "justify-start" : "justify-end"}`}
                        >
                            {isUser && (
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                        <User className="w-4 h-4 text-primary-600" />
                                    </div>
                                </div>
                            )}

                            <div className={`flex-1 ${isUser ? "max-w-[70%]" : "max-w-[70%]"}`}>
                                <div
                                    className={`rounded-lg p-4 ${
                                        isUser
                                            ? "bg-gray-100 text-gray-900"
                                            : "bg-primary-600 text-white"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {!isUser && (
                                            <Shield className="w-4 h-4" />
                                        )}
                                        <span className="text-xs font-medium opacity-75">
                                            {isUser ? (isCurrentUser ? "Você" : "Usuário") : "Suporte"}
                                        </span>
                                        <span className="text-xs opacity-50">
                                            {new Date(message.created_at).toLocaleString("pt-BR")}
                                        </span>
                                    </div>
                                    <p className="whitespace-pre-wrap break-words">{message.message}</p>
                                    {message.attachment_url && (
                                        <a
                                            href={message.attachment_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`mt-2 inline-flex items-center gap-2 text-sm ${
                                                isUser
                                                    ? "text-primary-600 hover:text-primary-700"
                                                    : "text-primary-100 hover:text-white"
                                            }`}
                                        >
                                            <Paperclip className="w-4 h-4" />
                                            Anexo
                                        </a>
                                    )}
                                </div>
                            </div>

                            {!isUser && (
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                                        <Shield className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}
