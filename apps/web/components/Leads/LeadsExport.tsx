"use client";

import { useState } from "react";
import { Button } from "@repo/ui";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface LeadsExportProps {
    filters: {
        quizId?: string;
        startDate?: string;
        endDate?: string;
    };
}

export default function LeadsExport({ filters }: LeadsExportProps) {
    const token = useAuthStore((state) => state.token);
    const [exporting, setExporting] = useState(false);

    const handleExport = async (format: "csv" | "excel") => {
        if (!token) return;

        setExporting(true);
        try {
            const queryParams = new URLSearchParams({
                format,
                ...(filters.quizId && { quizId: filters.quizId }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate }),
            });

            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
            const url = `${API_URL}/leads/export?${queryParams.toString()}`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Erro ao exportar leads");
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            
            // Extrair filename do header Content-Disposition
            const contentDisposition = response.headers.get("Content-Disposition");
            let filename = `leads_${new Date().toISOString().split('T')[0]}.${format === "csv" ? "csv" : "xlsx"}`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }
            
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error("Erro ao exportar:", error);
            alert("Erro ao exportar leads. Tente novamente.");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("csv")}
                disabled={exporting}
                className="flex items-center gap-2"
            >
                <FileText className="w-4 h-4" />
                Exportar CSV
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("excel")}
                disabled={exporting}
                className="flex items-center gap-2"
            >
                <FileSpreadsheet className="w-4 h-4" />
                Exportar Excel
            </Button>
        </div>
    );
}

