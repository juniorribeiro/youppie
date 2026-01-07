'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash2 } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    user_id: string | null;
    created_at: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'INFO',
        user_id: '',
        auto_open: false,
    });

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/notifications');
            setNotifications(response.data || []);
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/notifications', {
                ...formData,
                user_id: formData.user_id || undefined,
            });
            setShowForm(false);
            setFormData({ title: '', message: '', type: 'INFO', user_id: '', auto_open: false });
            fetchNotifications();
        } catch (error) {
            console.error('Erro ao criar notificação:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir esta notificação?')) return;
        try {
            await api.delete(`/admin/notifications/${id}`);
            fetchNotifications();
        } catch (error) {
            console.error('Erro ao excluir notificação:', error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Notificações</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    <Plus className="w-4 h-4" />
                    Nova Notificação
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Título</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Mensagem</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tipo</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                            >
                                <option value="INFO">Info</option>
                                <option value="WARNING">Aviso</option>
                                <option value="ERROR">Erro</option>
                                <option value="SUCCESS">Sucesso</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">User ID (deixe vazio para global)</label>
                            <input
                                type="text"
                                value={formData.user_id}
                                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="Opcional"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.auto_open}
                                onChange={(e) => setFormData({ ...formData, auto_open: e.target.checked })}
                            />
                            <label className="text-sm">Abrir automaticamente no login</label>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">
                                Criar
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 border rounded"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-center py-12">Carregando...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Escopo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criado em</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {notifications.map((notif) => (
                                <tr key={notif.id}>
                                    <td className="px-6 py-4">{notif.title}</td>
                                    <td className="px-6 py-4">{notif.type}</td>
                                    <td className="px-6 py-4">{notif.user_id ? 'Individual' : 'Global'}</td>
                                    <td className="px-6 py-4">
                                        {new Date(notif.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleDelete(notif.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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

