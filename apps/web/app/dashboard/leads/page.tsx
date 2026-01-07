"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth";
import { apiFetch } from "@/lib/api";
import { Button } from "@repo/ui";
import LeadsOverview from "@/components/Leads/LeadsOverview";
import LeadsFilters from "@/components/Leads/LeadsFilters";
import LeadsExport from "@/components/Leads/LeadsExport";
import LeadCard from "@/components/Leads/LeadCard";

interface Lead {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    quiz: {
        id: string;
        title: string;
        slug: string;
    };
    created_at: string;
}

interface LeadsByQuizResponse {
    quizzes: Array<{
        quiz: {
            id: string;
            title: string;
            slug: string;
        };
        leads: Lead[];
        total: number;
    }>;
}

type ViewMode = "overview" | "quiz";

export default function LeadsPage() {
    const token = useAuthStore((state) => state.token);
    const [viewMode, setViewMode] = useState<ViewMode>("overview");
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    const [overviewData, setOverviewData] = useState<LeadsByQuizResponse | null>(null);
    const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<{
        quizId?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
    }>({});

    const fetchOverviewData = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            const data = await apiFetch<LeadsByQuizResponse>("/leads/by-quiz", { token });
            setOverviewData(data);
        } catch (error) {
            console.error("Erro ao buscar leads:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchFilteredLeads = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.quizId) queryParams.append("quizId", filters.quizId);
            if (filters.startDate) queryParams.append("startDate", filters.startDate);
            if (filters.endDate) queryParams.append("endDate", filters.endDate);
            if (filters.search) queryParams.append("search", filters.search);
            queryParams.append("limit", "1000");

            const data = await apiFetch<{ leads: Lead[] }>(`/leads?${queryParams.toString()}`, { token });
            setFilteredLeads(data.leads);
        } catch (error) {
            console.error("Erro ao buscar leads filtrados:", error);
        } finally {
            setLoading(false);
        }
    }, [token, filters]);

    useEffect(() => {
        if (viewMode === "overview") {
            fetchOverviewData();
        } else if (viewMode === "quiz" && selectedQuizId) {
            setFilters((prev) => ({ ...prev, quizId: selectedQuizId }));
        }
    }, [viewMode, selectedQuizId, fetchOverviewData]);

    useEffect(() => {
        if (viewMode === "quiz") {
            fetchFilteredLeads();
        }
    }, [filters, viewMode, fetchFilteredLeads]);

    const handleQuizSelect = (quizId: string) => {
        setSelectedQuizId(quizId);
        setViewMode("quiz");
        setFilters({ ...filters, quizId });
    };

    const handleBack = () => {
        setViewMode("overview");
        setSelectedQuizId(null);
        setFilters({});
        setFilteredLeads([]);
    };

    const handleFilterChange = (newFilters: typeof filters) => {
        setFilters(newFilters);
    };

    if (loading && !overviewData && filteredLeads.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                        <p className="text-sm text-gray-500 mt-1">Visualize e gerencie os leads capturados</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                    <p className="text-sm text-gray-500 mt-1">Visualize e gerencie os leads capturados</p>
                </div>
                {viewMode === "overview" && overviewData && (
                    <LeadsExport filters={filters} />
                )}
                {viewMode === "quiz" && (
                    <div className="flex items-center gap-2">
                        <LeadsExport filters={filters} />
                        <Button variant="ghost" size="sm" onClick={handleBack}>
                            Voltar
                        </Button>
                    </div>
                )}
            </div>

            {/* Filtros */}
            {viewMode === "quiz" && (
                <LeadsFilters onFilterChange={handleFilterChange} />
            )}

            {/* Conteúdo */}
            {viewMode === "overview" && overviewData && (
                <LeadsOverview data={overviewData} onQuizSelect={handleQuizSelect} />
            )}

            {viewMode === "quiz" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {filteredLeads.length} {filteredLeads.length === 1 ? "lead encontrado" : "leads encontrados"}
                        </h2>
                    </div>
                    {filteredLeads.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>Nenhum lead encontrado com os filtros aplicados.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredLeads.map((lead) => (
                                <LeadCard key={lead.id} lead={lead} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

