'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LogOut } from 'lucide-react';

export default function Header() {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);
    const admin = useAuthStore((state) => state.admin);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Painel Administrativo</h1>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{admin?.name || admin?.email}</span>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                    <LogOut className="w-4 h-4" />
                    Sair
                </button>
            </div>
        </header>
    );
}

