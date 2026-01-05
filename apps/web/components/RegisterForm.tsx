"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@repo/ui";
import { apiFetch } from "@/lib/api";
import { User, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await apiFetch("/auth/register", {
                method: "POST",
                body: JSON.stringify({ name, email, password }),
            });

            setSuccess(true);
            setTimeout(() => router.push("/auth/login"), 1500);
        } catch (err: any) {
            setError(err.message || "Erro ao criar conta");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-success opacity-90"></div>
                <div className="relative z-10 glass rounded-2xl shadow-2xl p-8 text-center max-w-md animate-scale-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-success-500 rounded-full mb-4">
                        <CheckCircle className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Conta criada com sucesso!</h2>
                    <p className="text-gray-600">Redirecionando para o login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
            {/* Fundo com gradiente animado */}
            <div className="absolute inset-0 bg-gradient-sunset opacity-90"></div>
            <div className="absolute inset-0">
                <div className="absolute top-1/3 -left-32 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
            </div>

            {/* Card de Registro */}
            <div className="relative z-10 w-full max-w-md animate-fade-in">
                <div className="glass rounded-2xl shadow-2xl p-8 backdrop-blur-2xl">
                    {/* Logo/Título */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
                            <span className="text-3xl">🚀</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crie sua conta</h1>
                        <p className="text-gray-600">Comece a criar quizzes profissionais hoje</p>
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
                            <label className="text-sm font-semibold text-gray-700">Nome completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Seu nome"
                                    required
                                    className="pl-10"
                                />
                            </div>
                        </div>

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
                                    minLength={6}
                                    className="pl-10"
                                />
                            </div>
                            <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full text-lg py-3"
                            loading={loading}
                            variant="primary"
                        >
                            Criar conta
                        </Button>
                    </form>

                    {/* Link para login */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm">
                            Já tem uma conta?{" "}
                            <Link href="/auth/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                                Fazer login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
