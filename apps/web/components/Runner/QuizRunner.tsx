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

export default function QuizRunner({ slug }: { slug: string }) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [isAdvancing, setIsAdvancing] = useState(false);

    useEffect(() => {
        apiFetch<Quiz>(`/quizzes/public/${slug}`)
            .then((data) => {
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

        setIsAdvancing(true);

        try {
            if (currentStep.type === "QUESTION" && sessionId && val) {
                await apiFetch(`/sessions/${sessionId}/answers`, {
                    method: "POST",
                    body: JSON.stringify({
                        stepId: currentStep.id,
                        value: val,
                    }),
                });
            }

            if (isLastStep) {
                if (sessionId) {
                    await apiFetch(`/sessions/${sessionId}/complete`, { method: "POST" });
                }
                setCompleted(true);
            } else {
                setCurrentStepIndex(currentStepIndex + 1);
            }
        } catch (e) {
            console.error(e);
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
