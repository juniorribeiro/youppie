"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, PlusCircle, Settings, BarChart3, User, Users, Code, HelpCircle } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { useAuthStore } from "@/store/auth";
import { Button, Badge } from "@repo/ui";
import ExpandableMenu from "@/components/Dashboard/ExpandableMenu";
import TourProvider from "@/components/Tour/TourProvider";
import TourButton from "@/components/Tour/TourButton";
import { dashboardTourSteps } from "@/components/Tour/tourSteps";

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
            <TourProvider tourId="dashboard" steps={dashboardTourSteps}>
                <div className="flex min-h-screen bg-gray-50">
                    {/* Sidebar */}
                    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col" data-tour="sidebar">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-200">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <Image
                                src="/logo.png"
                                alt="Youppie"
                                width={270}
                                height={90}
                                className="h-12 w-auto"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        <Link href="/dashboard">
                            <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all cursor-pointer group" data-tour="dashboard-link">
                                <LayoutDashboard className="h-5 w-5" />
                                <span className="font-medium">Dashboard</span>
                            </div>
                        </Link>

                        <Link href="/dashboard/quiz/new">
                            <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-success-50 hover:text-success-600 rounded-lg transition-all cursor-pointer group" data-tour="create-quiz">
                                <PlusCircle className="h-5 w-5" />
                                <span className="font-medium">Novo Quiz</span>
                            </div>
                        </Link>

                        <Link href="/dashboard/analytics">
                            <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all cursor-pointer group" data-tour="analytics-link">
                                <BarChart3 className="h-5 w-5" />
                                <span className="font-medium">Analytics</span>
                            </div>
                        </Link>

                        <Link href="/dashboard/leads">
                            <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all cursor-pointer group" data-tour="leads-link">
                                <Users className="h-5 w-5" />
                                <span className="font-medium">Leads</span>
                            </div>
                        </Link>

                        <Link href="/dashboard/subscription">
                            <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-all cursor-pointer group">
                                <Settings className="h-5 w-5" />
                                <span className="font-medium">Assinatura</span>
                            </div>
                        </Link>

                        <ExpandableMenu
                            title="Configurações"
                            icon={<Settings className="h-5 w-5" />}
                        >
                            <Link href="/dashboard/settings/pixels">
                                <div className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all cursor-pointer group text-sm">
                                    <Code className="h-4 w-4" />
                                    <span>Pixel/Scripts</span>
                                </div>
                            </Link>
                        </ExpandableMenu>
                    </nav>

                    {/* User Info */}
                    <div className="p-4 border-t border-gray-200" data-tour="profile">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                            {user?.avatar_url ? (
                                <Image
                                    src={user.avatar_url}
                                    alt={user.name || 'Usuário'}
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Usuário'}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                {user?.subscription_plan && (
                                    <Badge 
                                        className={`mt-1 text-xs ${
                                            user.subscription_plan === 'FREE' ? 'bg-gray-100 text-gray-700' :
                                            user.subscription_plan === 'BASIC' ? 'bg-blue-100 text-blue-700' :
                                            user.subscription_plan === 'PRO' ? 'bg-purple-100 text-purple-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}
                                    >
                                        {user.subscription_plan === 'FREE' ? 'Free' :
                                         user.subscription_plan === 'BASIC' ? 'Basic' :
                                         user.subscription_plan === 'PRO' ? 'Pro' : 'Enterprise'}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <Link href="/dashboard/profile" className="w-full">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mb-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50"
                            >
                                <User className="mr-2 h-4 w-4" />
                                Perfil
                            </Button>
                        </Link>
                        <Link href="/docs" className="w-full" target="_blank" rel="noopener noreferrer">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                            >
                                <HelpCircle className="mr-2 h-4 w-4" />
                                Ajuda
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="w-full text-gray-600 hover:text-danger-600 hover:bg-danger-50"
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
                <TourButton tourId="dashboard" />
            </div>
            </TourProvider>
        </AuthGuard>
    );
}
