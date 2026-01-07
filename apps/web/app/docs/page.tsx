"use client";

import Link from "next/link";
import { ArrowLeft, Book, HelpCircle } from "lucide-react";
import { Button } from "@repo/ui";

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar ao Dashboard
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Book className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Documentação Youppie</h1>
                            <p className="text-gray-600 mt-1">Guia completo para usar o sistema</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-primary-600" />
                            Primeiros Passos
                        </h2>
                        <ul className="space-y-2">
                            <li><Link href="/docs/primeiros-passos/criar-conta" className="text-primary-600 hover:underline">Criar Conta</Link></li>
                            <li><Link href="/docs/primeiros-passos/fazer-login" className="text-primary-600 hover:underline">Fazer Login</Link></li>
                            <li><Link href="/docs/primeiros-passos/entender-dashboard" className="text-primary-600 hover:underline">Entender o Dashboard</Link></li>
                            <li><Link href="/docs/primeiros-passos/tour-guiado" className="text-primary-600 hover:underline">Tour Guiado</Link></li>
                        </ul>
                    </section>

                    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Criar Quizzes</h2>
                        <ul className="space-y-2">
                            <li><Link href="/docs/criar-quizzes/novo-quiz" className="text-primary-600 hover:underline">Criar Novo Quiz</Link></li>
                            <li><Link href="/docs/criar-quizzes/adicionar-perguntas" className="text-primary-600 hover:underline">Adicionar Perguntas</Link></li>
                            <li><Link href="/docs/criar-quizzes/adicionar-textos" className="text-primary-600 hover:underline">Adicionar Textos</Link></li>
                            <li><Link href="/docs/criar-quizzes/captura-de-leads" className="text-primary-600 hover:underline">Captura de Leads</Link></li>
                            <li><Link href="/docs/criar-quizzes/pagina-resultado" className="text-primary-600 hover:underline">Página de Resultado</Link></li>
                            <li><Link href="/docs/criar-quizzes/personalizar-aparencia" className="text-primary-600 hover:underline">Personalizar Aparência</Link></li>
                            <li><Link href="/docs/criar-quizzes/reordenar-steps" className="text-primary-600 hover:underline">Reordenar Steps</Link></li>
                            <li><Link href="/docs/criar-quizzes/publicar-quiz" className="text-primary-600 hover:underline">Publicar Quiz</Link></li>
                        </ul>
                    </section>

                    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Gerenciar Quizzes</h2>
                        <ul className="space-y-2">
                            <li><Link href="/docs/gerenciar-quizzes/editar-quiz" className="text-primary-600 hover:underline">Editar Quiz</Link></li>
                            <li><Link href="/docs/gerenciar-quizzes/visualizar-quiz" className="text-primary-600 hover:underline">Visualizar Quiz</Link></li>
                            <li><Link href="/docs/gerenciar-quizzes/excluir-quiz" className="text-primary-600 hover:underline">Excluir Quiz</Link></li>
                        </ul>
                    </section>

                    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Leads</h2>
                        <ul className="space-y-2">
                            <li><Link href="/docs/leads/visualizar-leads" className="text-primary-600 hover:underline">Visualizar Leads</Link></li>
                            <li><Link href="/docs/leads/filtrar-leads" className="text-primary-600 hover:underline">Filtrar Leads</Link></li>
                            <li><Link href="/docs/leads/exportar-leads" className="text-primary-600 hover:underline">Exportar Leads</Link></li>
                        </ul>
                    </section>

                    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics</h2>
                        <ul className="space-y-2">
                            <li><Link href="/docs/analytics/visao-geral" className="text-primary-600 hover:underline">Visão Geral</Link></li>
                            <li><Link href="/docs/analytics/analytics-detalhado" className="text-primary-600 hover:underline">Analytics Detalhado</Link></li>
                        </ul>
                    </section>

                    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Assinaturas</h2>
                        <ul className="space-y-2">
                            <li><Link href="/docs/assinaturas/planos-disponiveis" className="text-primary-600 hover:underline">Planos Disponíveis</Link></li>
                            <li><Link href="/docs/assinaturas/escolher-plano" className="text-primary-600 hover:underline">Escolher Plano</Link></li>
                            <li><Link href="/docs/assinaturas/gerenciar-assinatura" className="text-primary-600 hover:underline">Gerenciar Assinatura</Link></li>
                            <li><Link href="/docs/assinaturas/historico-pagamentos" className="text-primary-600 hover:underline">Histórico de Pagamentos</Link></li>
                        </ul>
                    </section>

                    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Configurações</h2>
                        <ul className="space-y-2">
                            <li><Link href="/docs/configuracoes/perfil" className="text-primary-600 hover:underline">Perfil</Link></li>
                            <li><Link href="/docs/configuracoes/alterar-senha" className="text-primary-600 hover:underline">Alterar Senha</Link></li>
                            <li><Link href="/docs/configuracoes/foto-perfil" className="text-primary-600 hover:underline">Foto de Perfil</Link></li>
                            <li><Link href="/docs/configuracoes/pixels-scripts" className="text-primary-600 hover:underline">Pixels/Scripts</Link></li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}

