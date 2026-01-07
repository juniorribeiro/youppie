'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Ticket {
    id: string;
    subject: string;
    status: string;
    priority: string;
    user: { name: string; email: string };
    created_at: string;
    _count: { messages: number };
}

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/tickets');
            setTickets(response.data || []);
        } catch (error) {
            console.error('Erro ao carregar tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.put(`/admin/tickets/${id}/status`, { status });
            fetchTickets();
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'RESOLVED':
            case 'CLOSED':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'OPEN':
                return <MessageSquare className="w-4 h-4 text-blue-500" />;
            default:
                return <Clock className="w-4 h-4 text-yellow-500" />;
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Tickets</h1>
            {loading ? (
                <div className="text-center py-12">Carregando...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assunto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridade</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mensagens</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tickets.map((ticket) => (
                                <tr key={ticket.id}>
                                    <td className="px-6 py-4">{ticket.subject}</td>
                                    <td className="px-6 py-4">{ticket.user.name} ({ticket.user.email})</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(ticket.status)}
                                            <span>{ticket.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{ticket.priority}</td>
                                    <td className="px-6 py-4">{ticket._count.messages}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={ticket.status}
                                            onChange={(e) => updateStatus(ticket.id, e.target.value)}
                                            className="text-sm border rounded px-2 py-1"
                                        >
                                            <option value="OPEN">Aberto</option>
                                            <option value="PENDING">Pendente</option>
                                            <option value="RESOLVED">Resolvido</option>
                                            <option value="CLOSED">Fechado</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

