"use client";

import { Button } from "@repo/ui";
import { LogIn } from "lucide-react";

interface HeaderProps {
    onLoginClick?: () => void;
}

export default function Header({ onLoginClick }: HeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">Y</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">Youppie</span>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="#recursos" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Recursos
                        </a>
                        <a href="#vantagens" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Vantagens
                        </a>
                        <a href="#como-funciona" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Como Funciona
                        </a>
                    </nav>

                    {/* Login Button */}
                    <Button
                        variant="primary"
                        size="md"
                        onClick={onLoginClick}
                        className="flex items-center gap-2"
                    >
                        <LogIn className="w-4 h-4" />
                        Entrar
                    </Button>
                </div>
            </div>
        </header>
    );
}

