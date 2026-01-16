"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, ArrowRight, Send, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@repo/ui";
import StepRenderer from "./StepRenderer";
import { interpolateText } from "@/lib/interpolation";

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

    // Extrair variáveis do answers para interpolação
    const variables = useMemo(() => {
        const vars: Record<string, any> = {};
        if (answers && answers.__variables__) {
            Object.assign(vars, answers.__variables__);
        }
        // Também extrair de INPUT steps diretamente do answers
        if (quiz) {
            quiz.steps.forEach(step => {
                if (step.type === 'INPUT' && step.metadata) {
                    const metadata = step.metadata as any;
                    const variableName = metadata.variableName;
                    if (variableName && answers[step.id] !== undefined) {
                        vars[variableName] = answers[step.id];
                    }
                }
            });
        }
        return vars;
    }, [answers, quiz]);

    // Processar step atual com interpolação
    const processedStep = useMemo(() => {
        if (!currentStep) return null;
        
        const processed = { ...currentStep };
        
        // Interpolar title
        if (processed.title) {
            processed.title = interpolateText(processed.title, variables);
        }
        
        // Interpolar description
        if (processed.description) {
            processed.description = interpolateText(processed.description, variables);
        }
        
        // Interpolar question text e options
        if (processed.question) {
            processed.question = {
                ...processed.question,
                text: interpolateText(processed.question.text, variables),
                options: processed.question.options?.map((opt: any) => ({
                    ...opt,
                    text: interpolateText(opt.text, variables),
                })),
            };
        }
        
        return processed;
    }, [currentStep, variables]);

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

        // Validar step QUESTION
        if (currentStep.type === "QUESTION") {
            const isMultipleChoice = (currentStep.metadata as any)?.multipleChoice === true;
            
            if (isMultipleChoice) {
                // Múltipla escolha: validação de array
                const selectedArray = Array.isArray(val) ? val : [];
                const minSelections = (currentStep.metadata as any)?.minSelections ?? 1;
                const maxSelections = (currentStep.metadata as any)?.maxSelections;

                if (selectedArray.length < minSelections) {
                    alert(`Por favor, selecione pelo menos ${minSelections} opção${minSelections > 1 ? 'ões' : ''}`);
                    return;
                }

                if (maxSelections !== null && maxSelections !== undefined && selectedArray.length > maxSelections) {
                    alert(`Por favor, selecione no máximo ${maxSelections} opção${maxSelections > 1 ? 'ões' : ''}`);
                    return;
                }

                if (selectedArray.length === 0) {
                    alert("Por favor, selecione pelo menos uma resposta");
                    return;
                }
            } else {
                // Escolha única: validação de string
                if (!val) {
                    alert("Por favor, selecione uma resposta");
                    return;
                }
            }
        }

        // Validar step INPUT - campo deve estar preenchido
        if (currentStep.type === "INPUT") {
            if (!val || (typeof val === 'string' && !val.trim())) {
                alert("Por favor, preencha o campo solicitado");
                return;
            }
        }

        // Validar step CAPTURE - todos os campos configurados são obrigatórios
        if (currentStep.type === "CAPTURE") {
            const captureFields = (currentStep.metadata?.captureFields as any) || { name: true, email: true, phone: false };
            const errors: Record<string, string> = {};
            
            // Validar nome se configurado
            if (captureFields.name !== false) {
                if (!val?.name || !val.name.trim()) {
                    errors.name = "O campo Nome é obrigatório";
                }
            }
            
            // Validar email se configurado
            if (captureFields.email !== false) {
                if (!val?.email || !val.email.trim()) {
                    errors.email = "O campo Email é obrigatório";
                } else {
                    // Validar formato de email
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(val.email.trim())) {
                        errors.email = "Por favor, insira um email válido";
                    }
                }
            }
            
            // Validar telefone se configurado
            if (captureFields.phone === true) {
                if (!val?.phone || !val.phone.trim()) {
                    errors.phone = "O campo Telefone é obrigatório";
                }
            }
            
            // Se houver erros, mostrar e impedir avanço
            if (Object.keys(errors).length > 0) {
                setValidationErrors(errors);
                return;
            }
            
            // Limpar erros se validação passou
            setValidationErrors({});
        }

        setIsAdvancing(true);

        try {

            // Salvar resposta para QUESTION e INPUT
            if ((currentStep.type === "QUESTION" || currentStep.type === "INPUT") && sessionId && val) {
                // Para múltipla escolha, garantir que seja enviado como array
                const isMultipleChoice = (currentStep.metadata as any)?.multipleChoice === true;
                const answerValue = isMultipleChoice 
                    ? (Array.isArray(val) ? val : [val])
                    : val;

                try {
                    await apiFetch(`/sessions/${sessionId}/answers`, {
                        method: "POST",
                        body: JSON.stringify({
                            stepId: currentStep.id,
                            value: answerValue,
                        }),
                    });
                } catch (error: any) {
                    // Se for erro de validação do backend (limites), mostrar mensagem
                    if (error.message && typeof error.message === 'string') {
                        const errorMsg = error.message.toLowerCase();
                        if (errorMsg.includes('selecione') || errorMsg.includes('opção')) {
                            alert(error.message);
                            return;
                        }
                    }
                    throw error;
                }
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

            // Determinar próximo step baseado em regras
            if (sessionId) {
                try {
                    const nextStepResponse = await apiFetch<{ 
                        stepId: string; 
                        stepIndex?: number;
                        message?: string;
                        redirect?: string;
                        score?: number;
                        actions?: Array<{ type: string; value?: any; target?: string }>;
                    }>(`/sessions/${sessionId}/next-step?currentStepId=${currentStep.id}`);
                    
                    // Tratar redirect (encerra quiz e redireciona)
                    if (nextStepResponse.redirect) {
                        await apiFetch(`/sessions/${sessionId}/complete`, { method: "POST" }).catch(() => {});
                        window.location.href = nextStepResponse.redirect;
                        return;
                    }
                    
                    // Tratar message (exibir alerta)
                    if (nextStepResponse.message) {
                        alert(nextStepResponse.message);
                    }
                    
                    if (nextStepResponse && nextStepResponse.stepId) {
                        // Encontrar o índice do próximo step
                        const nextStepIndex = nextStepResponse.stepIndex !== undefined 
                            ? nextStepResponse.stepIndex 
                            : quiz.steps.findIndex(s => s.id === nextStepResponse.stepId);
                        
                        if (nextStepIndex !== -1 && nextStepIndex < quiz.steps.length) {
                            setCurrentStepIndex(nextStepIndex);
                        } else if (nextStepIndex === quiz.steps.length - 1) {
                            // Último step
                            await apiFetch(`/sessions/${sessionId}/complete`, { method: "POST" });
                            setCompleted(true);
                        } else {
                            // Fallback: próximo em ordem
                            if (isLastStep) {
                                await apiFetch(`/sessions/${sessionId}/complete`, { method: "POST" });
                                setCompleted(true);
                            } else {
                                setCurrentStepIndex(currentStepIndex + 1);
                            }
                        }
                    } else {
                        // Não há próximo step (quiz termina)
                        await apiFetch(`/sessions/${sessionId}/complete`, { method: "POST" });
                        setCompleted(true);
                    }
                } catch (error) {
                    console.error('Error getting next step:', error);
                    // Fallback: próximo em ordem
                    if (isLastStep) {
                        if (sessionId) {
                            await apiFetch(`/sessions/${sessionId}/complete`, { method: "POST" });
                        }
                        setCompleted(true);
                    } else {
                        setCurrentStepIndex(currentStepIndex + 1);
                    }
                }
            } else {
                // Fallback se não há sessionId
                if (isLastStep) {
                    setCompleted(true);
                } else {
                    setCurrentStepIndex(currentStepIndex + 1);
                }
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

        // Auto-advance logic - only for QUESTION types with single choice (not multiple choice)
        const isMultipleChoice = (currentStep.metadata as any)?.multipleChoice === true;
        if (quiz.auto_advance === true && 
            currentStep.type === "QUESTION" && 
            !isAdvancing &&
            !isMultipleChoice) {
            setTimeout(() => handleNext(value), 400);
        }
    };

    // Show result page with CTA if last step is RESULT and completed
    if (completed) {
        const lastStep = quiz.steps[quiz.steps.length - 1];
        const processedLastStep = {
            ...lastStep,
            title: interpolateText(lastStep?.title, variables),
            description: interpolateText(lastStep?.description, variables),
        };
        const hasCta = lastStep?.type === "RESULT" && lastStep?.metadata?.cta_text && lastStep?.metadata?.cta_link;

        return (
            <div className="min-h-screen bg-gradient-success flex items-center justify-center p-4">
                <div className="max-w-2xl w-full glass rounded-3xl p-8 text-center animate-scale-in">
                    <StepRenderer
                        step={processedLastStep}
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
                        {processedStep && (
                            <StepRenderer
                                step={processedStep}
                                value={answers[currentStep?.id || ""]}
                                onChange={handleAnswerChange}
                                validationErrors={validationErrors}
                            />
                        )}
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
