import { Card, CardContent } from "@repo/ui";
import { 
    Type, 
    Image, 
    Layers, 
    Move, 
    Link2, 
    BarChart3 
} from "lucide-react";

const features = [
    {
        icon: Type,
        title: "Editor de Texto Rico",
        description: "Crie conteúdo visualmente atraente com formatação completa. Negrito, itálico, títulos, listas e muito mais. Personalize cores, tamanhos e alinhamento de texto.",
    },
    {
        icon: Image,
        title: "Biblioteca de Imagens",
        description: "Gerencie todas suas imagens em um só lugar. Upload fácil de PNG, JPG, GIF e WebP. Visualize dimensões e informações de cada imagem.",
    },
    {
        icon: Layers,
        title: "Múltiplos Tipos de Steps",
        description: "Crie perguntas com múltiplas opções, adicione textos informativos, capture dados dos usuários e personalize páginas de resultado com CTAs.",
    },
    {
        icon: Move,
        title: "Drag & Drop Intuitivo",
        description: "Reordene conteúdo facilmente com interface visual e amigável. Edição em tempo real para uma experiência fluida.",
    },
    {
        icon: Link2,
        title: "URLs Personalizadas",
        description: "Crie links únicos e compartilháveis. Publique seus quizzes com um clique e tenha controle total sobre visibilidade.",
    },
    {
        icon: BarChart3,
        title: "Dashboard Completo",
        description: "Visualize estatísticas em tempo real, gerencie leads capturados e acompanhe o desempenho dos seus quizzes.",
    },
];

export default function Features() {
    return (
        <section id="recursos" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Tudo que você precisa para criar quizzes incríveis
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Recursos poderosos em uma plataforma intuitiva e fácil de usar
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <Card
                                key={index}
                                className="hover-lift border-gray-200 transition-all duration-300 hover:border-primary-300"
                            >
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                                        <Icon className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

