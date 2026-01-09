"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Send, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@repo/ui";
import StepRenderer from "./StepRenderer";

interface Quiz {
    id: string;
    title: string;
    description: string | null;
    auto_advance?: boolean;
    steps: any[];
}

// Helper function para traduzir mensagens de erro conhecidas
function translateError(message: string): string {
    if (!message || typeof message !== 'string') {
        return message;
    }

    const lowerMessage = message.toLowerCase();
    
    // Se a mensagem já estiver em português correto, retornar como está
    if (lowerMessage.includes('o e-mail deve ser um endereço válido')) {
        return 'O e-mail deve ser um endereço válido';
    }

    // Detectar qualquer erro relacionado a email e sempre retornar a mensagem correta
    if (lowerMessage.includes('email') && (lowerMessage.includes('valid') || lowerMessage.includes('invalid') || lowerMessage.includes('endereço'))) {
        return 'O e-mail deve ser um endereço válido';
    }

    return message;
}

export default function QuizRunner({ slug }: { slug: string }) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [isAdvancing, setIsAdvancing] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        apiFetch<Quiz>(`/quizzes/public/${slug}`)
            .then((data) => {
                if (!data.id) {
                    throw new Error('Quiz ID not found in response');
                }
                
                setQuiz(data);
                return apiFetch<{ id: string }>("/sessions", {
                    method: "POST",
                    body: JSON.stringify({ quizId: data.id }),
                });
            })
            .then((session) => setSessionId(session.id))
            .catch((e) => alert(e.message))
            .finally(() => setLoading(false));
    }, [slug]);

    const currentStep = quiz?.steps[currentStepIndex];

    // Auto-complete session if we land on a RESULT step
    // Moved up to follow Rules of Hooks - MUST BE BEFORE ANY RETURN STATEMENT
    useEffect(() => {
        if (currentStep?.type === "RESULT" && sessionId && !completed) {
            apiFetch(`/sessions/${sessionId}/complete`, { method: "POST" })
                .then(() => setCompleted(true))
                .catch(console.error);
        }
    }, [currentStep, sessionId, completed]);

    // Limpar erros de validação quando mudar de step
    useEffect(() => {
        setValidationErrors({});
    }, [currentStepIndex]);

    if (loading || !quiz) {
        return (
            <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-semibold">Carregando quiz...</p>
                </div>
            </div>
        );
    }

    // currentStep is already defined above, but type narrowing after the check
    // If we're here, quiz is guaranteed to be not null

    const progress = ((currentStepIndex + 1) / quiz.steps.length) * 100;
    const isLastStep = currentStepIndex === quiz.steps.length - 1;

    const handleNext = async (answerValue?: any) => {
        if (isAdvancing) return; // Prevent double execution

        const val = answerValue !== undefined ? answerValue : answers[currentStep.id];

        if (currentStep.type === "QUESTION" && !val) {
            alert("Por favor, selecione uma resposta");
            return;
        }

        // Validar step CAPTURE - pelo menos um campo deve estar preenchido
        if (currentStep.type === "CAPTURE") {
            const captureFields = (currentStep.metadata?.captureFields as any) || { name: true, email: true, phone: false };
            const hasName = captureFields.name !== false && val?.name?.trim();
            const hasEmail = captureFields.email !== false && val?.email?.trim();
            const hasPhone = captureFields.phone === true && val?.phone?.trim();
            
            if (!hasName && !hasEmail && !hasPhone) {
                alert("Por favor, preencha pelo menos um dos campos solicitados");
                return;
            }
        }

        setIsAdvancing(true);

        try {
            // Limpar erros anteriores quando tentar avançar
            if (currentStep.type === "CAPTURE") {
                setValidationErrors({});
            }

            if (currentStep.type === "QUESTION" && sessionId && val) {
                await apiFetch(`/sessions/${sessionId}/answers`, {
                    method: "POST",
                    body: JSON.stringify({
                        stepId: currentStep.id,
                        value: val,
                    }),
                });
            }

            // Se for step CAPTURE e tiver dados, criar/atualizar lead
            if (currentStep.type === "CAPTURE" && val && (val.name || val.email || val.phone)) {
                if (!sessionId) {
                    // Se não existe sessão, criar uma nova com lead
                    const newSession = await apiFetch<{ id: string }>("/sessions", {
                        method: "POST",
                        body: JSON.stringify({
                            quizId: quiz.id,
                            lead: {
                                email: val.email || '',
                                name: val.name,
                                phone: val.phone,
                            },
                        }),
                    });
                    setSessionId(newSession.id);
                } else {
                    // Se já existe sessão, criar ou atualizar o lead
                    await apiFetch(`/sessions/${sessionId}/lead`, {
                        method: "POST",
                        body: JSON.stringify({
                            email: val.email || '',
                            name: val.name,
                            phone: val.phone,
                        }),
                    });
                }
            }

            if (isLastStep) {
                if (sessionId) {
                    await apiFetch(`/sessions/${sessionId}/complete`, { method: "POST" });
                }
                setCompleted(true);
            } else {
                setCurrentStepIndex(currentStepIndex + 1);
            }
        } catch (e: any) {
            console.error(e);
            
            // Se for erro de validação em step CAPTURE, extrair e exibir erros
            if (currentStep.type === "CAPTURE") {
                const errors: Record<string, string> = {};
                
                // Extrair erros do formato do backend
                if (e.errors && Array.isArray(e.errors)) {
                    // Formato: [{ field: "email" ou "lead.email", constraints: ["O e-mail deve ser um endereço válido"] }]
                    e.errors.forEach((error: any) => {
                        if (error.field && error.constraints && error.constraints.length > 0) {
                            const translatedMessage = error.constraints
                                .map((msg: string) => translateError(String(msg)))
                                .join(', ');
                            
                            // Lidar com campos aninhados (ex: "lead.email" -> "email")
                            let fieldName = error.field;
                            if (fieldName.includes('.')) {
                                // Se for campo aninhado como "lead.email", extrair apenas "email"
                                const parts = fieldName.split('.');
                                fieldName = parts[parts.length - 1];
                            }
                            
                            errors[fieldName] = translatedMessage;
                        }
                    });
                } else if (e.message) {
                    // Se não tiver formato estruturado, tentar extrair do message
                    // Pode ser uma string ou array
                    if (typeof e.message === 'string') {
                        const lowerMessage = e.message.toLowerCase();
                        // Tentar identificar o campo pelo erro (email é o mais comum)
                        if (lowerMessage.includes('email')) {
                            errors.email = translateError(e.message);
                        } else if (lowerMessage.includes('e-mail') || lowerMessage.includes('endereço')) {
                            // Fallback para mensagens em português
                            errors.email = translateError(e.message);
                        }
                    } else if (Array.isArray(e.message)) {
                        // Se message for array, processar cada erro
                        e.message.forEach((err: any) => {
                            if (typeof err === 'object' && err.property) {
                                let fieldName = err.property;
                                if (fieldName.includes('.')) {
                                    const parts = fieldName.split('.');
                                    fieldName = parts[parts.length - 1];
                                }
                                if (err.constraints && Object.keys(err.constraints).length > 0) {
                                    const translatedMessage = Object.values(err.constraints)
                                        .map((msg: any) => translateError(String(msg)))
                                        .join(', ');
                                    errors[fieldName] = translatedMessage;
                                }
                            } else if (typeof err === 'string') {
                                // Se for string simples, verificar se é erro de email
                                const lowerErr = err.toLowerCase();
                                if (lowerErr.includes('email') || lowerErr.includes('e-mail')) {
                                    errors.email = translateError(err);
                                }
                            }
                        });
                    }
                }
                
                // Fallback final: Se não conseguiu extrair erros mas há erro relacionado a email na mensagem
                if (Object.keys(errors).length === 0 && e.message) {
                    const errorMessage = String(e.message || '').toLowerCase();
                    if (errorMessage.includes('email') || errorMessage.includes('e-mail') || errorMessage.includes('endereço')) {
                        errors.email = 'O e-mail deve ser um endereço válido';
                    }
                }
                
                if (Object.keys(errors).length > 0) {
                    setValidationErrors(errors);
                    // Não avançar para o próximo step quando há erro
                    return;
                }
            }
        } finally {
            setIsAdvancing(false);
        }
    };

    const handlePrevious = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const handleAnswerChange = (value: any) => {
        setAnswers({ ...answers, [currentStep.id]: value });

        // Limpar erros de validação quando o usuário digitar em campos do step CAPTURE
        if (currentStep.type === "CAPTURE" && validationErrors) {
            const newErrors = { ...validationErrors };
            let hasChanges = false;
            
            // Se o campo foi alterado, remover seu erro
            if (value?.name !== undefined && validationErrors.name) {
                delete newErrors.name;
                hasChanges = true;
            }
            if (value?.email !== undefined && validationErrors.email) {
                delete newErrors.email;
                hasChanges = true;
            }
            if (value?.phone !== undefined && validationErrors.phone) {
                delete newErrors.phone;
                hasChanges = true;
            }
            
            if (hasChanges) {
                setValidationErrors(newErrors);
            }
        }

        // Auto-advance logic - only for QUESTION types
        if (quiz.auto_advance === true && currentStep.type === "QUESTION" && !isAdvancing) {
            setTimeout(() => handleNext(value), 400);
        }
    };

    // Show result page with CTA if last step is RESULT and completed
    if (completed) {
        const lastStep = quiz.steps[quiz.steps.length - 1];
        const hasCta = lastStep?.type === "RESULT" && lastStep?.metadata?.cta_text && lastStep?.metadata?.cta_link;

        return (
            <div className="min-h-screen bg-gradient-success flex items-center justify-center p-4">
                <div className="max-w-2xl w-full glass rounded-3xl p-8 text-center animate-scale-in">
                    <StepRenderer
                        step={lastStep}
                        value={null}
                        onChange={() => {}}
                        validationErrors={{}}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-primary flex flex-col">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-2 bg-white bg-opacity-20 z-50">
                <div
                    className="h-full bg-white transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4 pt-8">
                <div className="w-full max-w-3xl animate-fade-in">
                    {/* Step Counter */}
                    <div className="text-center mb-6">
                        <p className="text-white text-sm font-semibold opacity-90">
                            Pergunta {currentStepIndex + 1} de {quiz.steps.length}
                        </p>
                    </div>

                    {/* Step Content */}
                    <div className="glass rounded-3xl shadow-2xl p-8 backdrop-blur-2xl">
                        <StepRenderer
                            step={currentStep}
                            value={answers[currentStep?.id || ""]}
                            onChange={handleAnswerChange}
                            validationErrors={validationErrors}
                        />
                    </div>

                    {/* Navigation - Hide if RESULT step */}
                    {currentStep?.type !== "RESULT" && (
                        <div className="mt-6 flex gap-4 justify-between">
                            <Button
                                variant="ghost"
                                onClick={handlePrevious}
                                disabled={currentStepIndex === 0}
                                className="text-white hover:bg-white hover:bg-opacity-20"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Voltar
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => handleNext()}
                                disabled={isAdvancing}
                                className="bg-white text-primary-600 hover:bg-opacity-90"
                                size="lg"
                            >
                                {isLastStep ? (
                                    <>
                                        <Send className="mr-2 h-5 w-5" />
                                        Finalizar
                                    </>
                                ) : (
                                    <>
                                        Próximo
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
