"use client";

import { useEffect, useState } from "react";
import { Input, Button } from "@repo/ui";
import { CheckCircle2, AlertCircle } from "lucide-react";
import DOMPurify from "dompurify";
import Image from "next/image";

interface StepRendererProps {
    step: any;
    value: any;
    onChange: (v: any) => void;
    validationErrors?: Record<string, string>;
}

// Reusable component to render rich text HTML description
function RichDescription({ description, className = "" }: { description: string; className?: string }) {
    const [htmlContent, setHtmlContent] = useState<string>("");

    useEffect(() => {
        if (description && typeof window !== "undefined") {
            // Sanitize HTML on client side
            const clean = DOMPurify.sanitize(description, {
                ALLOWED_TAGS: [
                    "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4", "h5", "h6",
                    "ul", "ol", "li", "blockquote", "code", "pre", "a", "img", "div", "span"
                ],
                ALLOWED_ATTR: [
                    "href", "target", "rel", "src", "alt", "title", "class", "id", "style", "data-align"
                ],
            });
            setHtmlContent(clean);
        }
    }, [description]);

    if (!htmlContent) return null;

    return (
        <div className={`max-w-3xl mx-auto ${className}`}>
            <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-900 prose-em:text-gray-700 [&_img]:rounded-lg [&_img]:max-w-full [&_img]:my-4 [&_img]:mx-auto"
                style={{ textAlign: 'inherit' }}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
        </div>
    );
}

// Check if description contains HTML tags
function isHtmlContent(text: string | null): boolean {
    if (!text) return false;
    return /<[a-z][\s\S]*>/i.test(text);
}

// Separate component for RESULT step to properly use hooks
function ResultStep({ step }: { step: any }) {
    const hasDescription = Boolean(step.description && step.description.trim().length > 0);

    return (
        <div className="space-y-6 text-center animate-slide-up">
            {/* Only show default title/icon if no rich text description is present */}
            {!hasDescription && (
                <>
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-success-500 rounded-full mb-4">
                        <CheckCircle2 className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                </>
            )}

            {step.image_url && (
                <div className="relative w-full max-w-2xl mx-auto h-64 md:h-96 rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                    <Image
                        src={step.image_url}
                        alt={step.title}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
            )}

            {hasDescription && (
                <RichDescription description={step.description} />
            )}

            {step.metadata?.cta_text && step.metadata?.cta_link && (
                <div className="pt-8 animate-bounce-in flex justify-center">
                    <a href={step.metadata.cta_link} target="_blank" rel="noopener noreferrer">
                        <Button
                            size="lg"
                            className="min-w-[200px] text-xl px-10 py-6 h-auto shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 bg-success-600 hover:bg-success-700 text-white font-bold rounded-2xl"
                        >
                            {step.metadata.cta_text}
                        </Button>
                    </a>
                </div>
            )}
        </div>
    );
}

export default function StepRenderer({ step, value, onChange, validationErrors = {} }: StepRendererProps) {
    if (step.type === "TEXT") {
        const hasHtml = isHtmlContent(step.description);
        return (
            <div className="space-y-6 text-center animate-slide-up">
                <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                {step.image_url && (
                    <div className="relative w-full max-w-2xl mx-auto h-64 md:h-96 rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                        <Image
                            src={step.image_url}
                            alt={step.title}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                )}
                {step.description && (
                    hasHtml ? (
                        <RichDescription description={step.description} />
                    ) : (
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            {step.description}
                        </p>
                    )
                )}
            </div>
        );
    }

    if (step.type === "QUESTION" && step.question) {
        const hasHtml = isHtmlContent(step.description);
        return (
            <div className="space-y-8 animate-slide-up">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {step.question.text || step.title}
                    </h2>
                    {step.image_url && (
                        <div className="relative w-full max-w-2xl mx-auto h-64 md:h-96 rounded-lg overflow-hidden border border-gray-200 shadow-lg mb-4">
                            <Image
                                src={step.image_url}
                                alt={step.question.text || step.title}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                    )}
                    {step.description && (
                        hasHtml ? (
                            <RichDescription description={step.description} />
                        ) : (
                            <p className="text-gray-600">{step.description}</p>
                        )
                    )}
                </div>

                <div className="space-y-3">
                    {step.question.options.map((opt: any, idx: number) => {
                        const isSelected = value === opt.value;
                        return (
                            <button
                                key={opt.id || idx}
                                onClick={() => onChange(opt.value)}
                                className={`group relative w-full text-left p-5 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${isSelected
                                    ? "border-primary-500 bg-primary-50 shadow-lg"
                                    : "border-gray-200 bg-white hover:border-primary-300 hover:shadow-md"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                            ? "border-primary-500 bg-primary-500"
                                            : "border-gray-300 group-hover:border-primary-400"
                                            }`}
                                    >
                                        {isSelected ? (
                                            <CheckCircle2 className="h-6 w-6 text-white" />
                                        ) : (
                                            <span className="text-sm font-bold text-gray-400">{idx + 1}</span>
                                        )}
                                    </div>
                                    <span
                                        className={`flex-1 font-medium transition-colors ${isSelected ? "text-primary-700" : "text-gray-700 group-hover:text-gray-900"
                                            }`}
                                    >
                                        {opt.text}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (step.type === "CAPTURE") {
        const hasHtml = isHtmlContent(step.description);
        const captureFields = (step.metadata?.captureFields as any) || { name: true, email: true, phone: false };
        
        return (
            <div className="space-y-8 animate-slide-up">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {step.title || "Seus Dados"}
                    </h2>
                    {step.image_url && (
                        <div className="relative w-full max-w-2xl mx-auto h-64 md:h-96 rounded-lg overflow-hidden border border-gray-200 shadow-lg mb-4">
                            <Image
                                src={step.image_url}
                                alt={step.title || "Seus Dados"}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                    )}
                    {step.description && (
                        hasHtml ? (
                            <RichDescription description={step.description} />
                        ) : (
                            <p className="text-gray-600">{step.description}</p>
                        )
                    )}
                </div>

                <div className="space-y-4 max-w-md mx-auto">
                    {captureFields.name !== false && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Nome</label>
                            <Input
                                placeholder="Seu nome completo"
                                value={value?.name || ""}
                                onChange={(e) => onChange({ ...value, name: e.target.value })}
                                className={validationErrors.name ? "border-danger-300" : ""}
                            />
                            {validationErrors.name && (
                                <div className="text-danger-600 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>{validationErrors.name}</span>
                                </div>
                            )}
                        </div>
                    )}
                    {captureFields.email !== false && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Email</label>
                            <Input
                                type="email"
                                placeholder="seu@email.com"
                                value={value?.email || ""}
                                onChange={(e) => onChange({ ...value, email: e.target.value })}
                                className={validationErrors.email ? "border-danger-300" : ""}
                            />
                            {validationErrors.email && (
                                <div className="text-danger-600 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>{validationErrors.email}</span>
                                </div>
                            )}
                        </div>
                    )}
                    {captureFields.phone === true && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Telefone</label>
                            <Input
                                type="tel"
                                placeholder="(00) 00000-0000"
                                value={value?.phone || ""}
                                onChange={(e) => onChange({ ...value, phone: e.target.value })}
                                className={validationErrors.phone ? "border-danger-300" : ""}
                            />
                            {validationErrors.phone && (
                                <div className="text-danger-600 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>{validationErrors.phone}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (step.type === "RESULT") {
        return <ResultStep step={step} />;
    }

    return <div>Tipo de step não suportado</div>;
}
