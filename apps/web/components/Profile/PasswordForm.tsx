"use client";

import { useState } from "react";
import { Button, Input } from "@repo/ui";
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function PasswordForm() {
    const token = useAuthStore((state) => state.token);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        // Validações
        if (newPassword.length < 6) {
            setError("A nova senha deve ter pelo menos 6 caracteres");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("As senhas não coincidem");
            return;
        }

        setLoading(true);

        try {
            await apiFetch("/users/me/password", {
                method: "PATCH",
                token: token!,
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            setSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || "Erro ao alterar senha");
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
                    <span className="text-sm font-medium">Senha alterada com sucesso!</span>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Senha atual</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type={showCurrent ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Digite sua senha atual"
                        required
                        className="pl-10 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nova senha</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo de 6 caracteres"
                        required
                        minLength={6}
                        className="pl-10 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Confirmar nova senha</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Digite a nova senha novamente"
                        required
                        minLength={6}
                        className="pl-10 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full"
            >
                <Lock className="mr-2 h-4 w-4" />
                Alterar senha
            </Button>
        </form>
    );
}

