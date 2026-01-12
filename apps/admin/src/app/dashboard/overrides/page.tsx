'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash2, Edit } from 'lucide-react';

interface UserOverride {
    id: string;
    user_id: string;
    override_type: string;
    expires_at: string | null;
    metadata: any;
    user: { name: string; email: string };
}

export default function OverridesPage() {
    const [overrides, setOverrides] = useState<UserOverride[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        user_id: '',
        override_type: 'PLAN_LIMITS',
        expires_at: '',
        plan: 'BASIC', // Novo campo para seleção de plano
    });

    useEffect(() => {
        fetchOverrides();
    }, []);

    const fetchOverrides = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/user-overrides');
            setOverrides(response.data || []);
        } catch (error) {
            console.error('Erro ao carregar overrides:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Construir metadata baseado no tipo de override
            let metadata = {};
            if (formData.override_type === 'PLAN_LIMITS') {
                metadata = { plan: formData.plan };
            }

            await api.post('/admin/user-overrides', {
                user_id: formData.user_id,
                override_type: formData.override_type,
                expires_at: formData.expires_at || undefined,
                metadata: metadata,
            });
            setShowForm(false);
            setFormData({ user_id: '', override_type: 'PLAN_LIMITS', expires_at: '', plan: 'BASIC' });
            fetchOverrides();
        } catch (error) {
            console.error('Erro ao criar override:', error);
            alert('Erro ao criar override. Verifique se o User ID está correto e se todos os campos obrigatórios estão preenchidos.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir este override?')) return;
        try {
            await api.delete(`/admin/user-overrides/${id}`);
            fetchOverrides();
        } catch (error) {
            console.error('Erro ao excluir override:', error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Overrides</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    <Plus className="w-4 h-4" />
                    Novo Override
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">User ID</label>
                            <input
                                type="text"
                                value={formData.user_id}
                                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tipo</label>
                            <select
                                value={formData.override_type}
                                onChange={(e) => setFormData({ ...formData, override_type: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                            >
                                <option value="PLAN_LIMITS">Limites do Plano</option>
                                <option value="PREMIUM_FEATURES">Recursos Premium</option>
                                <option value="CUSTOM">Personalizado</option>
                            </select>
                        </div>
                        {formData.override_type === 'PLAN_LIMITS' && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Plano</label>
                                <select
                                    value={formData.plan}
                                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                >
                                    <option value="BASIC">Basic (15 quizzes)</option>
                                    <option value="PRO">Pro (30 quizzes)</option>
                                    <option value="ENTERPRISE">Enterprise (60 quizzes)</option>
                                    <option value="UNLIMITED">Ilimitado (sem limite)</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium mb-1">Data de Expiração (deixe vazio para perpétuo)</label>
                            <input
                                type="datetime-local"
                                value={formData.expires_at}
                                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                            />
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expira em</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {overrides.map((override) => {
                                const planName = override.override_type === 'PLAN_LIMITS' && override.metadata?.plan
                                    ? override.metadata.plan === 'BASIC' ? 'Basic (15 quizzes)'
                                        : override.metadata.plan === 'PRO' ? 'Pro (30 quizzes)'
                                        : override.metadata.plan === 'ENTERPRISE' ? 'Enterprise (60 quizzes)'
                                        : override.metadata.plan === 'UNLIMITED' ? 'Ilimitado'
                                        : override.metadata.plan
                                    : '-';
                                
                                return (
                                    <tr key={override.id}>
                                        <td className="px-6 py-4">{override.user.name} ({override.user.email})</td>
                                        <td className="px-6 py-4">{override.override_type}</td>
                                        <td className="px-6 py-4">{planName}</td>
                                        <td className="px-6 py-4">
                                            {override.expires_at
                                                ? new Date(override.expires_at).toLocaleDateString('pt-BR')
                                                : 'Perpétuo'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDelete(override.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

