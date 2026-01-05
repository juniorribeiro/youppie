"use client";

import { Button } from "@repo/ui";
import { ArrowRight, Play } from "lucide-react";

interface CTASectionProps {
    onLoginClick?: () => void;
}

export default function CTASection({ onLoginClick }: CTASectionProps) {
    return (
        <section className="py-20 bg-gradient-primary relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                    Pronto para criar seu primeiro quiz?
                </h2>
                <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                    Junte-se a milhares de pessoas que já estão usando o Youppie para
                    engajar audiências e capturar leads de forma inteligente.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        size="lg"
                        variant="secondary"
                        className="group text-lg px-8 py-4 bg-white text-primary-600 hover:bg-gray-50"
                        onClick={onLoginClick}
                    >
                        Começar Agora
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white/10"
                        onClick={() => {
                            document.getElementById("recursos")?.scrollIntoView({ behavior: "smooth" });
                        }}
                    >
                        <Play className="mr-2 w-5 h-5" />
                        Ver Demonstração
                    </Button>
                </div>
            </div>
        </section>
    );
}

