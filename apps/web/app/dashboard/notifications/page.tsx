"use client";

import { useEffect, useState } from "react";
import { Check, CheckCheck, Bell, Info, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { useNotificationsStore, Notification } from "@/store/notifications";
import { Button } from "@repo/ui";

type FilterType = "all" | "unread";

export default function NotificationsPage() {
    const [filter, setFilter] = useState<FilterType>("all");
    
    const notifications = useNotificationsStore((state) => state.notifications);
    const unreadCount = useNotificationsStore((state) => state.unreadCount);
    const isLoading = useNotificationsStore((state) => state.isLoading);
    const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);
    const markAsRead = useNotificationsStore((state) => state.markAsRead);
    const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const filteredNotifications = filter === "unread" 
        ? notifications.filter(n => !n.is_read)
        : notifications;

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) {
            return 'agora';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} min atrás`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} h atrás`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} dia${days > 1 ? 's' : ''} atrás`;
        } else {
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'WARNING':
                return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
            case 'ERROR':
                return <AlertCircle className="h-5 w-5 text-red-600" />;
            case 'INFO':
            default:
                return <Info className="h-5 w-5 text-blue-600" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'SUCCESS':
                return 'border-l-green-500 bg-green-50/50';
            case 'WARNING':
                return 'border-l-yellow-500 bg-yellow-50/50';
            case 'ERROR':
                return 'border-l-red-500 bg-red-50/50';
            case 'INFO':
            default:
                return 'border-l-blue-500 bg-blue-50/50';
        }
    };

    if (isLoading && notifications.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Carregando notificações...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {unreadCount > 0 
                            ? `${unreadCount} notificação${unreadCount > 1 ? 'ões' : ''} não lida${unreadCount > 1 ? 's' : ''}`
                            : 'Todas as notificações foram lidas'
                        }
                    </p>
                </div>
                
                {unreadCount > 0 && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-2"
                    >
                        <CheckCheck className="h-4 w-4" />
                        Marcar todas como lidas
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === "all"
                            ? "bg-primary-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                >
                    Todas ({notifications.length})
                </button>
                <button
                    onClick={() => setFilter("unread")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === "unread"
                            ? "bg-primary-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                >
                    Não lidas ({unreadCount})
                </button>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {filter === "unread" ? "Nenhuma notificação não lida" : "Nenhuma notificação"}
                    </h3>
                    <p className="text-gray-500">
                        {filter === "unread" 
                            ? "Você está em dia! Todas as suas notificações foram lidas."
                            : "Você ainda não recebeu notificações."
                        }
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="divide-y divide-gray-200">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${getTypeColor(notification.type)} ${
                                    !notification.is_read ? 'bg-blue-50/30' : ''
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-0.5">
                                        {getTypeIcon(notification.type)}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div className="flex-1">
                                                <h3 className={`text-lg font-semibold text-gray-900 mb-1 ${
                                                    !notification.is_read ? '' : 'opacity-75'
                                                }`}>
                                                    {notification.title}
                                                </h3>
                                                <p className={`text-gray-600 mb-2 ${
                                                    !notification.is_read ? '' : 'opacity-75'
                                                }`}>
                                                    {notification.message}
                                                </p>
                                            </div>
                                            
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                                    title="Marcar como lida"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-gray-400">
                                                {formatDate(notification.created_at)}
                                            </p>
                                            
                                            {!notification.is_read && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    Não lida
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
