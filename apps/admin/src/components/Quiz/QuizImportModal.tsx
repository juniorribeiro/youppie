"use client";

import { useState, useRef } from "react";
import api from "@/lib/api";
import { Upload, X, Loader2, AlertCircle, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuizImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface PreviewData {
    quiz: {
        title: string;
        description?: string;
        language: string;
        capture_mode: string;
        is_published: boolean;
        auto_advance: boolean;
    };
    stepsCount: number;
    resultPagesCount: number;
    slugConflict: boolean;
    existingSlug?: string;
    warnings: string[];
    errors: string[];
}

export default function QuizImportModal({ isOpen, onClose, onSuccess }: QuizImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<PreviewData | null>(null);
    const [importMode, setImportMode] = useState<'create' | 'replace'>('create');
    const [customSlug, setCustomSlug] = useState('');
    const [existingQuizId, setExistingQuizId] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(null);
            setError(null);
        }
    };

    const handlePreview = async () => {
        if (!file) {
            setError("Selecione um arquivo");
            return;
        }

        setPreviewLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/admin/quizzes/import/preview', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setPreview(response.data);

            if (response.data.errors && response.data.errors.length > 0) {
                setError(`Erros encontrados: ${response.data.errors.join(', ')}`);
            }
        } catch (err: any) {
            console.error('Erro ao fazer preview:', err);
            setError(err.response?.data?.message || 'Erro ao processar arquivo. Verifique se é um arquivo válido.');
            setPreview(null);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleImport = async () => {
        if (!file || !preview) {
            return;
        }

        if (preview.errors && preview.errors.length > 0) {
            setError("Corrija os erros antes de importar");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('importMode', importMode);
            
            if (importMode === 'create' && customSlug) {
                formData.append('newSlug', customSlug);
            }
            
            if (importMode === 'replace' && existingQuizId) {
                formData.append('existingQuizId', existingQuizId);
            }

            const response = await api.post('/admin/quizzes/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Limpar estado
            setFile(null);
            setPreview(null);
            setCustomSlug('');
            setExistingQuizId('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            onClose();
            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            console.error('Erro ao importar quiz:', err);
            setError(err.response?.data?.message || 'Erro ao importar quiz. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading && !previewLoading) {
            setFile(null);
            setPreview(null);
            setError(null);
            setCustomSlug('');
            setExistingQuizId('');
            setImportMode('create');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold">Importar Quiz (Admin)</h2>
                    <button
                        onClick={handleClose}
                        disabled={loading || previewLoading}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Upload de arquivo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selecione o arquivo (JSON ou ZIP)
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json,.zip,application/json,application/zip"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-primary-50 file:text-primary-700
                                    hover:file:bg-primary-100"
                            />
                            {file && (
                                <button
                                    onClick={handlePreview}
                                    disabled={previewLoading}
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    {previewLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Processando...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="h-4 w-4" />
                                            Visualizar Preview
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        {file && (
                            <p className="mt-2 text-sm text-gray-600">
                                Arquivo selecionado: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                            </p>
                        )}
                    </div>

                    {/* Preview - mesmo formato do web */}
                    {preview && (
                        <div className="border rounded-lg p-4 space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Preview do Quiz
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Título</label>
                                    <p className="text-sm">{preview.quiz.title}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Idioma</label>
                                    <p className="text-sm">{preview.quiz.language}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Modo de Captura</label>
                                    <p className="text-sm">{preview.quiz.capture_mode}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Steps</label>
                                    <p className="text-sm">{preview.stepsCount}</p>
                                </div>
                                {preview.resultPagesCount > 0 && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Páginas de Resultado</label>
                                        <p className="text-sm">{preview.resultPagesCount}</p>
                                    </div>
                                )}
                            </div>

                            {/* Avisos e erros - mesmo formato do web */}
                            {preview.warnings && preview.warnings.length > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-yellow-800 text-sm">Avisos:</p>
                                            <ul className="list-disc list-inside text-sm text-yellow-700 mt-1">
                                                {preview.warnings.map((warning, idx) => (
                                                    <li key={idx}>{warning}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {preview.errors && preview.errors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded p-3">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-red-800 text-sm">Erros:</p>
                                            <ul className="list-disc list-inside text-sm text-red-700 mt-1">
                                                {preview.errors.map((err, idx) => (
                                                    <li key={idx}>{err}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {preview.slugConflict && (
                                <div className="bg-orange-50 border border-orange-200 rounded p-3">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-orange-700">
                                            Um quiz com slug "{preview.existingSlug}" já existe. Um novo slug será gerado automaticamente.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Opções de importação */}
                            {(!preview.errors || preview.errors.length === 0) && (
                                <div className="space-y-4 pt-4 border-t">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Modo de Importação
                                        </label>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    value="create"
                                                    checked={importMode === 'create'}
                                                    onChange={(e) => setImportMode(e.target.value as 'create' | 'replace')}
                                                    className="text-primary-600"
                                                />
                                                <span className="text-sm">Criar novo quiz</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    value="replace"
                                                    checked={importMode === 'replace'}
                                                    onChange={(e) => setImportMode(e.target.value as 'create' | 'replace')}
                                                    className="text-primary-600"
                                                />
                                                <span className="text-sm">Substituir quiz existente</span>
                                            </label>
                                        </div>
                                    </div>

                                    {importMode === 'create' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Slug Personalizado (opcional)
                                            </label>
                                            <input
                                                type="text"
                                                value={customSlug}
                                                onChange={(e) => setCustomSlug(e.target.value)}
                                                placeholder="Deixe vazio para gerar automaticamente"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                            />
                                        </div>
                                    )}

                                    {importMode === 'replace' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ID do Quiz Existente
                                            </label>
                                            <input
                                                type="text"
                                                value={existingQuizId}
                                                onChange={(e) => setExistingQuizId(e.target.value)}
                                                placeholder="Cole o ID do quiz a ser substituído"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Erro geral */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer com botões */}
                <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={handleClose}
                        disabled={loading || previewLoading}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    {preview && (!preview.errors || preview.errors.length === 0) && (
                        <button
                            onClick={handleImport}
                            disabled={loading || previewLoading}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Importando...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    Importar Quiz
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
