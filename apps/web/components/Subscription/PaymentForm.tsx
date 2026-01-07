"use client";

import { useState, useEffect } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@repo/ui";
import { Loader2 } from "lucide-react";
import LoadingOverlay from "@/components/Loading/LoadingOverlay";

interface PaymentFormProps {
    clientSecret: string;
    onSuccess: () => void;
    onError: (error: string) => void;
}

export default function PaymentForm({ clientSecret, onSuccess, onError }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!stripe) {
            return;
        }

        if (!clientSecret) {
            return;
        }
    }, [stripe, clientSecret]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setMessage(null);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setMessage(submitError.message || "Erro ao processar formulário");
            setLoading(false);
            return;
        }

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
                return_url: `${window.location.origin}/dashboard?subscription=success`,
            },
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message || "Erro ao processar pagamento");
            onError(error.message || "Erro ao processar pagamento");
        } else if (paymentIntent) {
            // Para subscriptions, após confirmar o pagamento, sempre chamar onSuccess
            // O status pode variar, mas se não houve erro, o pagamento foi processado
            if (paymentIntent.status === "succeeded") {
                setMessage("Pagamento confirmado! Atualizando assinatura...");
                onSuccess();
            } else if (paymentIntent.status === "processing") {
                setMessage("Pagamento processando... Aguardando confirmação...");
                // Aguardar um pouco e chamar onSuccess mesmo assim
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            } else if (paymentIntent.status === "requires_action") {
                // 3D Secure ou autenticação adicional - o Stripe vai redirecionar
                setMessage("Aguardando autenticação adicional...");
                // Não chamar onSuccess aqui, o Stripe vai redirecionar
            } else {
                // Qualquer outro status - tentar mesmo assim
                setMessage(`Status: ${paymentIntent.status}. Processando...`);
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            }
        } else {
            setMessage("Aguardando confirmação do pagamento...");
        }

        setLoading(false);
    };

    return (
        <>
            <LoadingOverlay isLoading={loading} message="Processando pagamento..." />
            <form onSubmit={handleSubmit} className="space-y-6">
                <PaymentElement />
                
                {message && (
                    <div className={`p-3 rounded-lg ${
                        message.includes("Erro") || message.includes("erro")
                            ? "bg-danger-50 text-danger-700"
                            : "bg-blue-50 text-blue-700"
                    }`}>
                        {message}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={!stripe || !elements || loading}
                    loading={loading}
                    className="w-full"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processando...
                        </>
                    ) : (
                        "Confirmar Assinatura"
                    )}
                </Button>
            </form>
        </>
    );
}

