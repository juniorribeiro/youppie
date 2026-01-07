'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const token = useAuthStore((state) => state.token);
    const admin = useAuthStore((state) => state.admin);
    const [isHydrated, setIsHydrated] = useState(false);
    const isAuthenticated = !!token && !!admin;

    useEffect(() => {
        // Aguardar hidratação do Zustand persist
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated) return;

        if (!isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router, token, admin, isHydrated]);

    if (!isHydrated || !isAuthenticated) {
        return null;
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 p-6 bg-gray-50">{children}</main>
            </div>
        </div>
    );
}

