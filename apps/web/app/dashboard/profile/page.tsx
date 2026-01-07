"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import ProfileForm from "@/components/Profile/ProfileForm";
import PasswordForm from "@/components/Profile/PasswordForm";
import AvatarUpload from "@/components/Profile/AvatarUpload";
import { User, Lock, Image as ImageIcon } from "lucide-react";

interface UserData {
    id: string;
    name: string;
    email: string;
    avatar_url?: string | null;
}

export default function ProfilePage() {
    const token = useAuthStore((state) => state.token);
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const data = await apiFetch<UserData>("/users/me", { token });
            setUser(data);
        } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [token]);

    if (loading || !user) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Perfil</h1>
                    <p className="text-sm text-gray-500 mt-1">Gerencie suas informações pessoais</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Perfil</h1>
                <p className="text-sm text-gray-500 mt-1">Gerencie suas informações pessoais</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informações Básicas */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary-600" />
                            <CardTitle>Informações Básicas</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ProfileForm user={user} onUpdate={fetchUser} />
                    </CardContent>
                </Card>

                {/* Avatar */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-primary-600" />
                            <CardTitle>Foto de Perfil</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <AvatarUpload currentAvatarUrl={user.avatar_url} onUpdate={fetchUser} />
                    </CardContent>
                </Card>

                {/* Alterar Senha */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary-600" />
                            <CardTitle>Alterar Senha</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <PasswordForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

