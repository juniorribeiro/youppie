"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Card, Badge } from "@repo/ui";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import TicketMessages from "@/components/Tickets/TicketMessages";
import TicketMessageForm from "@/components/Tickets/TicketMessageForm";
import { ArrowLeft, Clock } from "lucide-react";

interface Ticket {
    id: string;
    subject: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    messages: Array<{
        id: string;
        sender_type: string;
        sender_id: string;
        message: string;
        attachment_url?: string | null;
        created_at: string;
    }>;
}

export default function TicketDetailPage() {
    const router = useRouter();
    const params = useParams();
    const ticketId = params.id as string;
    const token = useAuthStore((state) => state.token);
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);

    const loadTicket = async () => {
        if (!token || !ticketId) return;

        setLoading(true);
        try {
            const data = await apiFetch<Ticket>(`/tickets/${ticketId}`, { token });
            setTicket(data);
        } catch (error) {
            console.error("Erro ao carregar ticket:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTicket();
    }, [token, ticketId]);

    const handleSendMessage = async (message: string, attachment?: File) => {
        if (!token || !ticketId) return;

        setSubmitting(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
            const formData = new FormData();
            formData.append("message", message);
            if (attachment) {
                formData.append("attachment", attachment);
            }

            const response = await fetch(`${API_URL}/tickets/${ticketId}/messages`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Erro ao enviar mensagem");
            }

            await loadTicket();
        } catch (error: any) {
            throw error;
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!token || !ticketId) return;

        setStatusUpdating(true);
        try {
            await apiFetch(`/tickets/${ticketId}/status`, {
                method: "PUT",
                token,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });
            await loadTicket();
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
        } finally {
            setStatusUpdating(false);
        }
    };

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

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 bg-gray-200 animate-pulse rounded w-64"></div>
                <div className="h-96 bg-gray-200 animate-pulse rounded"></div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Ticket não encontrado</p>
                <Button variant="primary" onClick={() => router.push("/dashboard/tickets")}>
                    Voltar para Tickets
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard/tickets")}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </Button>
            </div>

            <Card className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.subject}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                            </span>
                            <span className={getPriorityColor(ticket.priority)}>
                                Prioridade: {ticket.priority}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Criado em {new Date(ticket.created_at).toLocaleString("pt-BR")}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={ticket.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={statusUpdating}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="OPEN">Aberto</option>
                            <option value="PENDING">Pendente</option>
                            <option value="RESOLVED">Resolvido</option>
                            <option value="CLOSED">Fechado</option>
                        </select>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Mensagens</h2>
                    <TicketMessages messages={ticket.messages} />
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Responder</h2>
                    <TicketMessageForm onSubmit={handleSendMessage} loading={submitting} />
                </div>
            </Card>
        </div>
    );
}
