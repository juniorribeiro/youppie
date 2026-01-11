"use client";

import { Card } from "@repo/ui";
import { MessageSquare, Clock } from "lucide-react";

interface TicketCardProps {
    ticket: {
        id: string;
        subject: string;
        status: string;
        priority: string;
        created_at: string;
        updated_at: string;
        _count: {
            messages: number;
        };
    };
}

export default function TicketCard({ ticket }: TicketCardProps) {
    const getStatusColor = (status: string) => {
        const statusMap: Record<string, string> = {
            OPEN: "bg-blue-100 text-blue-800",
            PENDING: "bg-yellow-100 text-yellow-800",
            RESOLVED: "bg-green-100 text-green-800",
            CLOSED: "bg-gray-100 text-gray-800",
        };
        return statusMap[status] || "bg-gray-100 text-gray-800";
    };

    const getPriorityColor = (priority: string) => {
        const priorityMap: Record<string, string> = {
            LOW: "text-gray-600",
            MEDIUM: "text-yellow-600",
            HIGH: "text-red-600",
        };
        return priorityMap[priority] || "text-gray-600";
    };

    return (
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{ticket.subject}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                        </span>
                        <span className={getPriorityColor(ticket.priority)}>
                            Prioridade: {ticket.priority}
                        </span>
                        <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {ticket._count.messages} mensagem{ticket._count.messages !== 1 ? "ns" : ""}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
