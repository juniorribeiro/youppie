"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, PlusCircle, Settings, BarChart3, User } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { useAuthStore } from "@/store/auth";
import { Button } from "@repo/ui";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <AuthGuard>
            <div className="flex min-h-screen bg-gray-50">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                Q
                            </div>
                            <span className="text-xl font-bold text-gray-900">Youppie</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        <Link href="/dashboard">
                            <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all cursor-pointer group">
                                <LayoutDashboard className="h-5 w-5" />
                                <span className="font-medium">Dashboard</span>
                            </div>
                        </Link>

                        <Link href="/dashboard/quiz/new">
                            <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-success-50 hover:text-success-600 rounded-lg transition-all cursor-pointer group">
                                <PlusCircle className="h-5 w-5" />
                                <span className="font-medium">Novo Quiz</span>
                            </div>
                        </Link>
                    </nav>

                    {/* User Info */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Usuário'}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="w-full mt-2 text-gray-600 hover:text-danger-600 hover:bg-danger-50"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair
                        </Button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    {/* Header */}
                    <header className="bg-white border-b border-gray-200 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Meus Quizzes</h1>
                                <p className="text-sm text-gray-500 mt-1">Gerencie e crie seus quizzes</p>
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
