"use client";

import Image from "next/image";
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
                    <div className="flex items-center space-x-3">
                        <Image
                            src="/logo.png"
                            alt="Youppie"
                            width={270}
                            height={90}
                            className="h-12 w-auto"
                            priority
                        />
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

