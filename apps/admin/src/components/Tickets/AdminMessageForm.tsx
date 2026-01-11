'use client';

import { useState, useRef } from 'react';
import { Upload, X, Paperclip } from 'lucide-react';

interface AdminMessageFormProps {
    onSubmit: (message: string, attachment?: File) => Promise<void>;
    loading?: boolean;
}

export default function AdminMessageForm({ onSubmit, loading }: AdminMessageFormProps) {
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setError('O arquivo deve ter no máximo 10MB');
            return;
        }

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedTypes.includes(file.type)) {
            setError('Tipo de arquivo não permitido');
            return;
        }

        setAttachment(file);
        setError('');
    };

    const handleRemoveAttachment = () => {
        setAttachment(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!message.trim()) {
            setError('A mensagem é obrigatória');
            return;
        }

        try {
            await onSubmit(message, attachment || undefined);
            setMessage('');
            setAttachment(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar mensagem');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite sua resposta..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                />
            </div>

            {attachment ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-gray-600" />
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
                        id="admin-message-attachment"
                    />
                    <label
                        htmlFor="admin-message-attachment"
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <Upload className="w-4 h-4" />
                        Anexar arquivo
                    </label>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading || !message.trim()}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Enviando...' : 'Enviar Resposta'}
                </button>
            </div>
        </form>
    );
}
