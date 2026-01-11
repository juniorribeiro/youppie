'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { MessageSquare, CheckCircle, Clock, Eye } from 'lucide-react';

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
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [priorityFilter, setPriorityFilter] = useState<string>('');

    useEffect(() => {
        fetchTickets();
    }, [statusFilter, priorityFilter]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (priorityFilter) params.append('priority', priorityFilter);
            const query = params.toString();
            const response = await api.get(`/admin/tickets${query ? `?${query}` : ''}`);
            setTickets(response.data || []);
        } catch (error) {
            console.error('Erro ao carregar tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const statusMap: Record<string, string> = {
            OPEN: 'bg-blue-100 text-blue-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
            RESOLVED: 'bg-green-100 text-green-800',
            CLOSED: 'bg-gray-100 text-gray-800',
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority: string) => {
        const priorityMap: Record<string, string> = {
            LOW: 'text-gray-600',
            MEDIUM: 'text-yellow-600',
            HIGH: 'text-red-600',
        };
        return priorityMap[priority] || 'text-gray-600';
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Tickets</h1>
            
            <div className="mb-4 flex gap-2">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                    <option value="">Todos os status</option>
                    <option value="OPEN">Aberto</option>
                    <option value="PENDING">Pendente</option>
                    <option value="RESOLVED">Resolvido</option>
                    <option value="CLOSED">Fechado</option>
                </select>
                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                    <option value="">Todas as prioridades</option>
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-12">Carregando...</div>
            ) : tickets.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum ticket encontrado</p>
                </div>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{ticket.subject}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{ticket.user.name}</div>
                                        <div className="text-sm text-gray-500">{ticket.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <MessageSquare className="w-4 h-4" />
                                            {ticket._count.messages}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/dashboard/tickets/${ticket.id}`}
                                            className="inline-flex items-center gap-1 px-3 py-1 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Ver detalhes
                                        </Link>
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

