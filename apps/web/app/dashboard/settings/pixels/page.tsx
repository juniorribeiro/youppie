"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Textarea } from "@repo/ui";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Save, Code } from "lucide-react";
import LoadingOverlay from "@/components/Loading/LoadingOverlay";

interface TrackingData {
    google_analytics_id?: string;
    google_tag_manager_id?: string;
    facebook_pixel_id?: string;
    tracking_head?: string;
    tracking_body?: string;
    tracking_footer?: string;
}

export default function PixelsSettingsPage() {
    const token = useAuthStore((state) => state.token);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<TrackingData>({
        google_analytics_id: "",
        google_tag_manager_id: "",
        facebook_pixel_id: "",
        tracking_head: "",
        tracking_body: "",
        tracking_footer: "",
    });

    useEffect(() => {
        const fetchTrackingData = async () => {
            if (!token) return;

            try {
                setLoading(true);
                const user = await apiFetch<{ 
                    google_analytics_id?: string;
                    google_tag_manager_id?: string;
                    facebook_pixel_id?: string;
                    tracking_head?: string;
                    tracking_body?: string;
                    tracking_footer?: string;
                }>("/users/me", { token });

                setFormData({
                    google_analytics_id: user.google_analytics_id || "",
                    google_tag_manager_id: user.google_tag_manager_id || "",
                    facebook_pixel_id: user.facebook_pixel_id || "",
                    tracking_head: user.tracking_head || "",
                    tracking_body: user.tracking_body || "",
                    tracking_footer: user.tracking_footer || "",
                });
            } catch (error) {
                console.error("Erro ao buscar dados de tracking:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrackingData();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!token) return;

        // Verificar se pelo menos um campo está preenchido
        const hasData = Object.values(formData).some(value => value && value.trim() !== "");
        if (!hasData) {
            alert("Preencha pelo menos um campo para salvar.");
            return;
        }

        setSaving(true);
        try {
            await apiFetch("/users/tracking", {
                method: "PATCH",
                token,
                body: JSON.stringify(formData),
            });
            alert("Configurações salvas com sucesso!");
        } catch (error: any) {
            console.error("Erro ao salvar:", error);
            alert(error.message || "Erro ao salvar configurações");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: keyof TrackingData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6">
            <LoadingOverlay isLoading={loading || saving} message={saving ? "Salvando..." : "Carregando..."} />
            
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Pixel/Scripts</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Configure códigos de acompanhamento e integrações que serão aplicados nos seus quizzes
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code className="h-5 w-5" />
                            Códigos de Tracking
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Google Analytics ID
                            </label>
                            <textarea
                                value={formData.google_analytics_id}
                                onChange={(e) => handleChange("google_analytics_id", e.target.value)}
                                placeholder="Cole aqui o código completo do Google Analytics"
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Cole o código completo do script do Google Analytics
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Google Tag Manager ID
                            </label>
                            <textarea
                                value={formData.google_tag_manager_id}
                                onChange={(e) => handleChange("google_tag_manager_id", e.target.value)}
                                placeholder="Cole aqui o código completo do Google Tag Manager"
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Cole o código completo do script do Google Tag Manager
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Facebook Pixel ID
                            </label>
                            <textarea
                                value={formData.facebook_pixel_id}
                                onChange={(e) => handleChange("facebook_pixel_id", e.target.value)}
                                placeholder="Cole aqui o código completo do Facebook Pixel"
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Cole o código completo do script do Facebook Pixel
                            </p>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Códigos Customizados</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Head
                                    </label>
                                    <textarea
                                        value={formData.tracking_head}
                                        onChange={(e) => handleChange("tracking_head", e.target.value)}
                                        placeholder="Código que será injetado no <head>"
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Código que será injetado dentro da tag &lt;head&gt;
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Body
                                    </label>
                                    <textarea
                                        value={formData.tracking_body}
                                        onChange={(e) => handleChange("tracking_body", e.target.value)}
                                        placeholder="Código que será injetado antes de </body>"
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Código que será injetado antes do fechamento da tag &lt;/body&gt;
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Footer
                                    </label>
                                    <textarea
                                        value={formData.tracking_footer}
                                        onChange={(e) => handleChange("tracking_footer", e.target.value)}
                                        placeholder="Código que será injetado no final do <body>"
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Código que será injetado no final da tag &lt;body&gt;
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <Button
                                type="submit"
                                disabled={saving}
                                loading={saving}
                                className="flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Salvar Configurações
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}

