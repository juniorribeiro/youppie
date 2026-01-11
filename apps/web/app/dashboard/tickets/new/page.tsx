"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@repo/ui";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Upload, X, AlertCircle } from "lucide-react";

export default function NewTicketPage() {
    const router = useRouter();
    const token = useAuthStore((state) => state.token);
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [attachment, setAttachment] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamanho (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError("O arquivo deve ter no máximo 10MB");
            return;
        }

        // Validar tipo
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError("Tipo de arquivo não permitido. Use: JPG, PNG, GIF, WEBP, PDF ou DOC/DOCX");
            return;
        }

        setAttachment(file);
        setError("");
    };

    const handleRemoveAttachment = () => {
        setAttachment(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!subject.trim()) {
            setError("O assunto é obrigatório");
            return;
        }

        if (!description.trim()) {
            setError("A descrição é obrigatória");
            return;
        }

        if (!token) {
            setError("Não autenticado");
            return;
        }

        setLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
            const formData = new FormData();
            formData.append("subject", subject);
            formData.append("description", description);
            if (attachment) {
                formData.append("attachment", attachment);
            }

            const response = await fetch(`${API_URL}/tickets`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Erro ao criar ticket");
            }

            const ticket = await response.json();
            router.push(`/dashboard/tickets/${ticket.id}`);
        } catch (err: any) {
            setError(err.message || "Erro ao criar ticket. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Novo Ticket de Suporte</h1>
                <p className="text-gray-600 mt-1">Descreva sua dúvida ou problema e nossa equipe irá ajudá-lo</p>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                            Assunto *
                        </label>
                        <Input
                            id="subject"
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Ex: Problema ao criar quiz"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Descrição *
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva detalhadamente sua dúvida ou problema..."
                            rows={8}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Anexo (Opcional)
                        </label>
                        {attachment ? (
                            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Upload className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm text-gray-700">{attachment.name}</span>
                                    <span className="text-xs text-gray-500">
                                        ({(attachment.size / 1024).toFixed(2)} KB)
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveAttachment}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileSelect}
                                    accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    className="hidden"
                                    id="attachment"
                                />
                                <label
                                    htmlFor="attachment"
                                    className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
                                >
                                    <Upload className="w-5 h-5 text-gray-600" />
                                    <span className="text-sm text-gray-700">Clique para anexar arquivo</span>
                                </label>
                                <p className="text-xs text-gray-500 mt-2">
                                    Formatos aceitos: JPG, PNG, GIF, WEBP, PDF, DOC, DOCX (máx. 10MB)
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => router.back()}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" loading={loading}>
                            Criar Ticket
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
