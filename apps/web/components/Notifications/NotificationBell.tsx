"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotificationsStore, Notification } from "@/store/notifications";
import { Badge } from "@repo/ui";
import { Button } from "@repo/ui";

export default function NotificationBell() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const unreadCount = useNotificationsStore((state) => state.unreadCount);
    const notifications = useNotificationsStore((state) => state.notifications);
    const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);
    const markAsRead = useNotificationsStore((state) => state.markAsRead);
    const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);

    // Buscar notificações quando dropdown abrir
    useEffect(() => {
        if (isOpen) {
            fetchNotifications(true); // Buscar apenas não lidas para o dropdown
        }
    }, [isOpen, fetchNotifications]);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
        
        return () => {}; // Cleanup vazio quando isOpen é false
    }, [isOpen]);

    // Buscar todas as notificações quando componente montar
    useEffect(() => {
        fetchNotifications(true);
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await markAsRead(id);
    };

    const handleMarkAllAsRead = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await markAllAsRead();
    };

    const handleNotificationClick = (notification: Notification) => {
        setIsOpen(false);
        // Marcar como lida ao clicar
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        // Aqui poderia redirecionar para uma página específica baseada no tipo de notificação
        router.push("/dashboard/notifications");
    };

    const handleViewAll = () => {
        setIsOpen(false);
        router.push("/dashboard/notifications");
    };

    // Mostrar apenas 5 notificações não lidas no dropdown
    const unreadNotifications = notifications.filter(n => !n.is_read).slice(0, 5);

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
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} dia${days > 1 ? 's' : ''} atrás`;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'SUCCESS':
                return 'border-l-green-500';
            case 'WARNING':
                return 'border-l-yellow-500';
            case 'ERROR':
                return 'border-l-red-500';
            case 'INFO':
            default:
                return 'border-l-blue-500';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notificações"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    title="Marcar todas como lidas"
                                >
                                    <CheckCheck className="h-4 w-4" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                aria-label="Fechar"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {unreadNotifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">Nenhuma notificação não lida</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {unreadNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${getTypeColor(notification.type)} ${!notification.is_read ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.is_read && (
                                                        <button
                                                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                                            title="Marcar como lida"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {formatDate(notification.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleViewAll}
                                className="w-full"
                            >
                                Ver todas as notificações
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
