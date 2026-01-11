'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import AdminMessageForm from '@/components/Tickets/AdminMessageForm';
import { ArrowLeft, User, Shield, Paperclip, Clock } from 'lucide-react';

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
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [updatingPriority, setUpdatingPriority] = useState(false);

    const loadTicket = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/tickets/${ticketId}`);
            setTicket(response.data);
        } catch (error) {
            console.error('Erro ao carregar ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTicket();
    }, [ticketId]);

    const handleSendMessage = async (message: string, attachment?: File) => {
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('message', message);
            if (attachment) {
                formData.append('attachment', attachment);
            }

            await api.post(`/admin/tickets/${ticketId}/messages`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            await loadTicket();
        } catch (error) {
            throw error;
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        setUpdatingStatus(true);
        try {
            await api.put(`/admin/tickets/${ticketId}/status`, { status: newStatus });
            await loadTicket();
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handlePriorityChange = async (newPriority: string) => {
        setUpdatingPriority(true);
        try {
            await api.put(`/admin/tickets/${ticketId}/priority`, { priority: newPriority });
            await loadTicket();
        } catch (error) {
            console.error('Erro ao atualizar prioridade:', error);
        } finally {
            setUpdatingPriority(false);
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
                <button
                    onClick={() => router.push('/dashboard/tickets')}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    Voltar para Tickets
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/dashboard/tickets')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.subject}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                            </span>
                            <span className={getPriorityColor(ticket.priority)}>
                                Prioridade: {ticket.priority}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Criado em {new Date(ticket.created_at).toLocaleString('pt-BR')}
                            </span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-gray-600" />
                                <span className="font-medium text-gray-900">Usuário</span>
                            </div>
                            <div className="text-sm text-gray-700">
                                <div>{ticket.user.name}</div>
                                <div className="text-gray-500">{ticket.user.email}</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={ticket.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                disabled={updatingStatus}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="OPEN">Aberto</option>
                                <option value="PENDING">Pendente</option>
                                <option value="RESOLVED">Resolvido</option>
                                <option value="CLOSED">Fechado</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Prioridade</label>
                            <select
                                value={ticket.priority}
                                onChange={(e) => handlePriorityChange(e.target.value)}
                                disabled={updatingPriority}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="LOW">Baixa</option>
                                <option value="MEDIUM">Média</option>
                                <option value="HIGH">Alta</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Mensagens</h2>
                    <div className="space-y-4">
                        {ticket.messages.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>Nenhuma mensagem ainda</p>
                            </div>
                        ) : (
                            ticket.messages.map((message) => {
                                const isUser = message.sender_type === 'USER';

                                return (
                                    <div
                                        key={message.id}
                                        className={`flex gap-3 ${isUser ? 'justify-start' : 'justify-end'}`}
                                    >
                                        {isUser && (
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-gray-600" />
                                                </div>
                                            </div>
                                        )}

                                        <div className={`flex-1 ${isUser ? 'max-w-[70%]' : 'max-w-[70%]'}`}>
                                            <div
                                                className={`rounded-lg p-4 ${
                                                    isUser
                                                        ? 'bg-gray-100 text-gray-900'
                                                        : 'bg-primary-600 text-white'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    {!isUser && <Shield className="w-4 h-4" />}
                                                    <span className="text-xs font-medium opacity-75">
                                                        {isUser ? 'Usuário' : 'Admin'}
                                                    </span>
                                                    <span className="text-xs opacity-50">
                                                        {new Date(message.created_at).toLocaleString('pt-BR')}
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
                                                                ? 'text-primary-600 hover:text-primary-700'
                                                                : 'text-primary-100 hover:text-white'
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
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Responder</h2>
                    <AdminMessageForm onSubmit={handleSendMessage} loading={submitting} />
                </div>
            </div>
        </div>
    );
}
