'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Users, MessageSquare, Bell, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        users: 0,
        tickets: 0,
        notifications: 0,
        alerts: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersRes, ticketsRes, notificationsRes, alertsRes] = await Promise.all([
                    api.get('/admin/users?limit=1'),
                    api.get('/admin/tickets?limit=1'),
                    api.get('/admin/notifications?limit=1'),
                    api.get('/admin/system-alerts?active_only=true'),
                ]);

                setStats({
                    users: usersRes.data.pagination?.total || 0,
                    tickets: Array.isArray(ticketsRes.data) ? ticketsRes.data.length : 0,
                    notifications: Array.isArray(notificationsRes.data) ? notificationsRes.data.length : 0,
                    alerts: Array.isArray(alertsRes.data) ? alertsRes.data.length : 0,
                });
            } catch (error) {
                console.error('Erro ao carregar estatísticas:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="text-center py-12">Carregando...</div>;
    }

    const statCards = [
        { label: 'Usuários', value: stats.users, icon: Users, color: 'bg-blue-500' },
        { label: 'Tickets', value: stats.tickets, icon: MessageSquare, color: 'bg-green-500' },
        { label: 'Notificações', value: stats.notifications, icon: Bell, color: 'bg-yellow-500' },
        { label: 'Alertas Ativos', value: stats.alerts, icon: AlertTriangle, color: 'bg-red-500' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">{stat.label}</p>
                                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                                </div>
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

