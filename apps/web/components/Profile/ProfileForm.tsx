"use client";

import { useState, useEffect } from "react";
import { Button, Input } from "@repo/ui";
import { Save, CheckCircle, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface ProfileFormProps {
    user: {
        id: string;
        name: string;
        email: string;
    };
    onUpdate?: () => void;
}

export default function ProfileForm({ user, onUpdate }: ProfileFormProps) {
    const token = useAuthStore((state) => state.token);
    const setAuth = useAuthStore((state) => state.setAuth);
    const currentUser = useAuthStore((state) => state.user);
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setName(user.name);
        setEmail(user.email);
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true);

        try {
            const updated = await apiFetch<{ id: string; name: string; email: string }>("/users/me", {
                method: "PATCH",
                token: token!,
                body: JSON.stringify({ name, email }),
            });

            // Atualizar store de autenticação
            if (currentUser) {
                setAuth(token!, { ...currentUser, name: updated.name, email: updated.email });
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            onUpdate?.();
        } catch (err: any) {
            setError(err.message || "Erro ao atualizar perfil");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="flex items-center gap-2 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {success && (
                <div className="flex items-center gap-2 p-4 bg-success-50 border border-success-200 rounded-lg text-success-700">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Perfil atualizado com sucesso!</span>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nome completo</label>
                <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">E-mail</label>
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full"
            >
                <Save className="mr-2 h-4 w-4" />
                Salvar alterações
            </Button>
        </form>
    );
}

