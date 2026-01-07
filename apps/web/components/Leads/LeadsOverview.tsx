"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { Users, ChevronRight } from "lucide-react";
import { Button } from "@repo/ui";
import LeadCard from "./LeadCard";

interface Lead {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    created_at: string;
}

interface QuizLeads {
    quiz: {
        id: string;
        title: string;
        slug: string;
    };
    leads: Lead[];
    total: number;
}

interface LeadsOverviewProps {
    data: {
        quizzes: QuizLeads[];
    };
    onQuizSelect?: (quizId: string) => void;
}

export default function LeadsOverview({ data, onQuizSelect }: LeadsOverviewProps) {
    return (
        <div className="space-y-6">
            {data.quizzes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Nenhum lead encontrado ainda.</p>
                    <p className="text-sm mt-2">Os leads aparecerão aqui quando alguém preencher seus quizzes.</p>
                </div>
            ) : (
                data.quizzes.map((quizLeads) => (
                    <Card key={quizLeads.quiz.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">{quizLeads.quiz.title}</CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {quizLeads.total} {quizLeads.total === 1 ? "lead" : "leads"}
                                    </p>
                                </div>
                                {onQuizSelect && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onQuizSelect(quizLeads.quiz.id)}
                                        className="flex items-center gap-2"
                                    >
                                        Ver todos
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {quizLeads.leads.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    Nenhum lead para este quiz
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {quizLeads.leads.slice(0, 6).map((lead) => (
                                        <LeadCard key={lead.id} lead={lead} />
                                    ))}
                                </div>
                            )}
                            {quizLeads.leads.length > 6 && (
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-500">
                                        Mostrando 6 de {quizLeads.leads.length} leads
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}

