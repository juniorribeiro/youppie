"use client";

import { useState, useRef } from "react";
import { Button } from "@repo/ui";
import { Upload, User, CheckCircle, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import Image from "next/image";

interface AvatarUploadProps {
    currentAvatarUrl?: string | null;
    onUpdate?: () => void;
}

export default function AvatarUpload({ currentAvatarUrl, onUpdate }: AvatarUploadProps) {
    const token = useAuthStore((state) => state.token);
    const setAuth = useAuthStore((state) => state.setAuth);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith("image/")) {
            setError("Por favor, selecione uma imagem");
            return;
        }

        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("A imagem deve ter no máximo 5MB");
            return;
        }

        setError("");
        // Criar preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!fileInputRef.current?.files?.[0] || !token) return;

        const file = fileInputRef.current.files[0];
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
            const response = await fetch(`${API_URL}/users/me/avatar`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || "Erro ao fazer upload");
            }

            const updated = await response.json();

            // Atualizar store de autenticação
            if (currentUser) {
                setAuth(token, { ...currentUser, avatar_url: updated.avatar_url });
            }

            setPreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            onUpdate?.();
        } catch (err: any) {
            setError(err.message || "Erro ao fazer upload da imagem");
        } finally {
            setLoading(false);
        }
    };

    const displayImage = preview || currentAvatarUrl;

    return (
        <div className="space-y-4">
            {error && (
                <div className="flex items-center gap-2 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {success && (
                <div className="flex items-center gap-2 p-4 bg-success-50 border border-success-200 rounded-lg text-success-700">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Foto atualizada com sucesso!</span>
                </div>
            )}

            <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                    {displayImage ? (
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
                            <Image
                                src={displayImage}
                                alt="Avatar"
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                            <User className="w-12 h-12 text-gray-400" />
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-3">
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            {preview ? "Trocar imagem" : "Selecionar foto"}
                        </Button>
                    </div>

                    {preview && (
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleUpload}
                            loading={loading}
                            className="w-full"
                        >
                            Salvar foto
                        </Button>
                    )}

                    <p className="text-xs text-gray-500">
                        Formatos aceitos: PNG, JPG, GIF, WebP. Tamanho máximo: 5MB
                    </p>
                </div>
            </div>
        </div>
    );
}

