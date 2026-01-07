"use client";

import Image from "next/image";
import { Button } from "@repo/ui";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroProps {
    onLoginClick?: () => void;
}

export default function Hero({ onLoginClick }: HeroProps) {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-purple-50"></div>
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    {/* Logo Grande */}
                    <div className="flex justify-center mb-12 animate-fade-in">
                        <Image
                            src="/logo-grande.png"
                            alt="Youppie"
                            width={400}
                            height={133}
                            className="w-full max-w-md h-auto"
                            priority
                        />
                    </div>

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-8 animate-fade-in">
                        <Sparkles className="w-4 h-4" />
                        Plataforma de Quizzes Interativos
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-slide-up">
                        Crie Quizzes Interativos que
                        <span className="block text-transparent bg-clip-text bg-gradient-primary mt-2">
                            Engajam e Convertem
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 animate-slide-up">
                        O Youppie é a plataforma completa para criar experiências de quiz personalizadas.
                        <span className="block mt-2">
                            Capture leads, engaje sua audiência e transforme interações em resultados.
                        </span>
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in">
                        <Button
                            size="lg"
                            variant="primary"
                            className="group text-lg px-8 py-4"
                            onClick={onLoginClick}
                        >
                            Começar Agora
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="text-lg px-8 py-4"
                            onClick={() => {
                                document.getElementById("recursos")?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            Ver Recursos
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-in">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
                            <div className="text-gray-600">Sem Código</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary-600 mb-2">∞</div>
                            <div className="text-gray-600">Quizzes Ilimitados</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary-600 mb-2">24/7</div>
                            <div className="text-gray-600">Disponível</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

