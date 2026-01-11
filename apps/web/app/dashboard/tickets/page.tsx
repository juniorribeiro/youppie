"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button, Card, Badge } from "@repo/ui";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import TicketCard from "@/components/Tickets/TicketCard";

interface Ticket {
    id: string;
    subject: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    _count: {
        messages: number;
    };
}

export default function TicketsPage() {
    const token = useAuthStore((state) => state.token);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("");

    const loadTickets = async () => {
        if (!token) return;

        setLoading(true);
        try {
            const queryParams = statusFilter ? `?status=${statusFilter}` : "";
            const data = await apiFetch<Ticket[]>(`/tickets${queryParams}`, { token });
            setTickets(data);
        } catch (error) {
            console.error("Erro ao carregar tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTickets();
    }, [token, statusFilter]);

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; color: string }> = {
            OPEN: { label: "Aberto", color: "bg-blue-500" },
            PENDING: { label: "Pendente", color: "bg-yellow-500" },
            RESOLVED: { label: "Resolvido", color: "bg-green-500" },
            CLOSED: { label: "Fechado", color: "bg-gray-500" },
        };

        const statusInfo = statusMap[status] || { label: status, color: "bg-gray-500" };
        return (
            <Badge className={`${statusInfo.color} text-white`}>
                {statusInfo.label}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 bg-gray-200 animate-pulse rounded w-64"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-gray-200 animate-pulse rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tickets de Suporte</h1>
                    <p className="text-gray-600 mt-1">Gerencie seus tickets de suporte e dúvidas</p>
                </div>
                <Link href="/dashboard/tickets/new">
                    <Button variant="primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Ticket
                    </Button>
                </Link>
            </div>

            <Card className="p-4">
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setStatusFilter("")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            statusFilter === ""
                                ? "bg-primary-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setStatusFilter("OPEN")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            statusFilter === "OPEN"
                                ? "bg-primary-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Abertos
                    </button>
                    <button
                        onClick={() => setStatusFilter("PENDING")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            statusFilter === "PENDING"
                                ? "bg-primary-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Pendentes
                    </button>
                    <button
                        onClick={() => setStatusFilter("RESOLVED")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            statusFilter === "RESOLVED"
                                ? "bg-primary-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Resolvidos
                    </button>
                    <button
                        onClick={() => setStatusFilter("CLOSED")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            statusFilter === "CLOSED"
                                ? "bg-primary-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Fechados
                    </button>
                </div>

                {tickets.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Nenhum ticket encontrado</p>
                        <Link href="/dashboard/tickets/new">
                            <Button variant="primary">
                                <Plus className="w-4 h-4 mr-2" />
                                Criar Primeiro Ticket
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tickets.map((ticket) => (
                            <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`}>
                                <TicketCard ticket={ticket} />
                            </Link>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
