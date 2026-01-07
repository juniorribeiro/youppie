'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface SystemAlert {
    id: string;
    title: string;
    message: string;
    type: string;
    dismissible: boolean;
    active: boolean;
    created_at: string;
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<SystemAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'INFO',
        dismissible: true,
        active: true,
    });

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/system-alerts');
            setAlerts(response.data || []);
        } catch (error) {
            console.error('Erro ao carregar alertas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/system-alerts', formData);
            setShowForm(false);
            setFormData({ title: '', message: '', type: 'INFO', dismissible: true, active: true });
            fetchAlerts();
        } catch (error) {
            console.error('Erro ao criar alerta:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir este alerta?')) return;
        try {
            await api.delete(`/admin/system-alerts/${id}`);
            fetchAlerts();
        } catch (error) {
            console.error('Erro ao excluir alerta:', error);
        }
    };

    const toggleActive = async (id: string, currentActive: boolean) => {
        try {
            await api.put(`/admin/system-alerts/${id}`, { active: !currentActive });
            fetchAlerts();
        } catch (error) {
            console.error('Erro ao atualizar alerta:', error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Alertas do Sistema</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    <Plus className="w-4 h-4" />
                    Novo Alerta
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
                                <option value="CRITICAL">Crítico</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.dismissible}
                                onChange={(e) => setFormData({ ...formData, dismissible: e.target.checked })}
                            />
                            <label className="text-sm">Pode ser dispensado</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.active}
                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            />
                            <label className="text-sm">Ativo</label>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dispensável</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criado em</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {alerts.map((alert) => (
                                <tr key={alert.id}>
                                    <td className="px-6 py-4">{alert.title}</td>
                                    <td className="px-6 py-4">{alert.type}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleActive(alert.id, alert.active)}
                                            className="flex items-center gap-2"
                                        >
                                            {alert.active ? (
                                                <ToggleRight className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <ToggleLeft className="w-5 h-5 text-gray-400" />
                                            )}
                                            <span>{alert.active ? 'Ativo' : 'Inativo'}</span>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">{alert.dismissible ? 'Sim' : 'Não'}</td>
                                    <td className="px-6 py-4">
                                        {new Date(alert.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleDelete(alert.id)}
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

