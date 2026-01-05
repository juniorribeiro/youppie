import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">Y</span>
                            </div>
                            <span className="text-xl font-bold text-white">Youppie</span>
                        </div>
                        <p className="text-gray-400 mb-4 max-w-md">
                            Plataforma completa para criar quizzes interativos que engajam e convertem.
                            Transforme interações em resultados.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#recursos" className="hover:text-white transition-colors">
                                    Recursos
                                </a>
                            </li>
                            <li>
                                <a href="#vantagens" className="hover:text-white transition-colors">
                                    Vantagens
                                </a>
                            </li>
                            <li>
                                <a href="#como-funciona" className="hover:text-white transition-colors">
                                    Como Funciona
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Contato</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="mailto:contato@youppie.com" className="hover:text-white transition-colors">
                                    contato@youppie.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
                    <p>© 2024 Youppie. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}

