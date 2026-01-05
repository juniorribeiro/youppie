"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@repo/ui";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginForm() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await apiFetch<{ access_token: string; user: any }>("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });

            setAuth(data.access_token, data.user);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Email ou senha inválidos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
            {/* Fundo com gradiente animado */}
            <div className="absolute inset-0 bg-gradient-primary opacity-90"></div>
            <div className="absolute inset-0">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
            </div>

            {/* Card de Login */}
            <div className="relative z-10 w-full max-w-md animate-fade-in">
                <div className="glass rounded-2xl shadow-2xl p-8 backdrop-blur-2xl">
                    {/* Logo/Título */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
                            <span className="text-3xl">🎯</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta!</h1>
                        <p className="text-gray-600">Entre para continuar criando quizzes incríveis</p>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 animate-scale-in">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full text-lg py-3"
                            loading={loading}
                            variant="primary"
                        >
                            Entrar
                        </Button>
                    </form>

                    {/* Link para registro */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm">
                            Não tem uma conta?{" "}
                            <Link href="/auth/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                                Criar conta grátis
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
