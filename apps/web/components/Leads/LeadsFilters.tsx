"use client";

import { useState, useEffect } from "react";
import { Input, Button } from "@repo/ui";
import { Search, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface Quiz {
    id: string;
    title: string;
    slug: string;
}

interface LeadsFiltersProps {
    onFilterChange: (filters: {
        quizId?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
    }) => void;
}

export default function LeadsFilters({ onFilterChange }: LeadsFiltersProps) {
    const token = useAuthStore((state) => state.token);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [selectedQuizId, setSelectedQuizId] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [search, setSearch] = useState<string>("");

    useEffect(() => {
        if (token) {
            apiFetch<Quiz[]>("/quizzes", { token })
                .then(setQuizzes)
                .catch(console.error);
        }
    }, [token]);

    const handleApplyFilters = () => {
        onFilterChange({
            quizId: selectedQuizId || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            search: search.trim() || undefined,
        });
    };

    const handleClearFilters = () => {
        setSelectedQuizId("");
        setStartDate("");
        setEndDate("");
        setSearch("");
        onFilterChange({});
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Limpar
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Quiz</label>
                    <select
                        value={selectedQuizId}
                        onChange={(e) => setSelectedQuizId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">Todos os quizzes</option>
                        {quizzes.map((quiz) => (
                            <option key={quiz.id} value={quiz.id}>
                                {quiz.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Data Inicial</label>
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Data Final</label>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Buscar</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Nome ou e-mail"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button variant="primary" onClick={handleApplyFilters}>
                    Aplicar Filtros
                </Button>
            </div>
        </div>
    );
}

