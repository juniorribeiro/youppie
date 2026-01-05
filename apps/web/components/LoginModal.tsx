"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Mail, Lock, AlertCircle, User, CheckCircle } from "lucide-react";
import { Button, Input } from "@repo/ui";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ModalMode = "login" | "register";

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [mode, setMode] = useState<ModalMode>("login");
    
    // Login state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    // Register state
    const [name, setName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setEmail("");
            setPassword("");
            setName("");
            setRegisterEmail("");
            setRegisterPassword("");
            setError("");
            setSuccess(false);
            setMode("login");
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await apiFetch<{ access_token: string; user: any }>("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });

            setAuth(data.access_token, data.user);
            onClose();
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Email ou senha inválidos");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await apiFetch("/auth/register", {
                method: "POST",
                body: JSON.stringify({ name, email: registerEmail, password: registerPassword }),
            });

            setSuccess(true);
            setTimeout(() => {
                setMode("login");
                setSuccess(false);
                setRegisterEmail("");
                setRegisterPassword("");
                setName("");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Erro ao criar conta");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                    aria-label="Fechar"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-8">
                    {/* Mode Tabs */}
                    <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => {
                                setMode("login");
                                setError("");
                                setSuccess(false);
                            }}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                                mode === "login"
                                    ? "bg-white text-primary-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            Entrar
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode("register");
                                setError("");
                                setSuccess(false);
                            }}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                                mode === "register"
                                    ? "bg-white text-primary-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            Criar Conta
                        </button>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full shadow-lg mb-4">
                            <span className="text-3xl">{mode === "login" ? "🎯" : "🚀"}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
                        </h2>
                        <p className="text-gray-600 text-sm">
                            {mode === "login"
                                ? "Entre com sua conta para continuar"
                                : "Comece a criar quizzes profissionais hoje"}
                        </p>
                    </div>

                    {/* Success Message */}
                    {success && mode === "register" && (
                        <div className="flex items-center gap-2 p-4 bg-success-50 border border-success-200 rounded-lg text-success-700 animate-scale-in mb-5">
                            <CheckCircle className="h-5 w-5 flex-shrink-0" />
                            <span className="text-sm font-medium">Conta criada com sucesso! Faça login para continuar.</span>
                        </div>
                    )}

                    {/* Login Form */}
                    {mode === "login" && (
                        <form onSubmit={handleLogin} className="space-y-5">
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
                                        autoFocus
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
                    )}

                    {/* Register Form */}
                    {mode === "register" && (
                        <form onSubmit={handleRegister} className="space-y-5">
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
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        type="email"
                                        value={registerEmail}
                                        onChange={(e) => setRegisterEmail(e.target.value)}
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
                                        value={registerPassword}
                                        onChange={(e) => setRegisterPassword(e.target.value)}
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
                    )}
                </div>
            </div>
        </div>
    );
}

