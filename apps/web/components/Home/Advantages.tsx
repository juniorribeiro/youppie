import { CheckCircle2 } from "lucide-react";

const advantages = [
    {
        title: "Sem Código Necessário",
        description: "Interface visual intuitiva. Crie quizzes profissionais sem programação com editor WYSIWYG.",
    },
    {
        title: "Captura de Leads Inteligente",
        description: "Colete informações antes, durante ou após o quiz. Gerencie todos os leads em um só lugar.",
    },
    {
        title: "Totalmente Personalizável",
        description: "Design e conteúdo sob seu controle. Múltiplos tipos de conteúdo para experiências únicas.",
    },
    {
        title: "Análise e Insights",
        description: "Acompanhe respostas e engajamento. Visualize estatísticas detalhadas e tome decisões baseadas em dados.",
    },
    {
        title: "Rápido e Eficiente",
        description: "Crie quizzes em minutos. Interface responsiva e moderna com performance otimizada.",
    },
    {
        title: "Seguro e Confiável",
        description: "Dados protegidos, infraestrutura robusta e backup automático para sua tranquilidade.",
    },
];

export default function Advantages() {
    return (
        <section id="vantagens" className="py-20 bg-gradient-to-br from-primary-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Por que escolher o Youppie?
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Vantagens que fazem a diferença na criação de suas experiências interativas
                    </p>
                </div>

                {/* Advantages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {advantages.map((advantage, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-primary-600" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {advantage.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {advantage.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

