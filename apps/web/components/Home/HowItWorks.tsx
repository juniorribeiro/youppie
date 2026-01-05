import { Card, CardContent } from "@repo/ui";
import { PenTool, Settings, Share2 } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: PenTool,
        title: "Crie e Personalize",
        description: "Use o editor visual para criar seu quiz. Adicione perguntas, textos e imagens. Personalize cores e estilos.",
    },
    {
        number: "02",
        icon: Settings,
        title: "Configure Captura de Leads",
        description: "Escolha quando coletar informações. Defina quais dados capturar e configure páginas de resultado.",
    },
    {
        number: "03",
        icon: Share2,
        title: "Publique e Compartilhe",
        description: "Publique com um clique. Compartilhe o link personalizado e acompanhe resultados em tempo real.",
    },
];

export default function HowItWorks() {
    return (
        <section id="como-funciona" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Crie seu quiz em 3 passos simples
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Processo intuitivo e rápido para começar a engajar sua audiência
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={index} className="relative">
                                {/* Connector Line (hidden on mobile) */}
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary-200 to-transparent z-0" style={{ width: 'calc(100% - 4rem)', marginLeft: '4rem' }}></div>
                                )}
                                
                                <Card className="relative z-10 hover-lift border-gray-200">
                                    <CardContent className="p-8 text-center">
                                        {/* Step Number */}
                                        <div className="text-6xl font-bold text-primary-100 mb-4">
                                            {step.number}
                                        </div>
                                        
                                        {/* Icon */}
                                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Icon className="w-8 h-8 text-primary-600" />
                                        </div>
                                        
                                        {/* Title */}
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                            {step.title}
                                        </h3>
                                        
                                        {/* Description */}
                                        <p className="text-gray-600 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

