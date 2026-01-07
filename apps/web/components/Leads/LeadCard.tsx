import { Card, CardContent } from "@repo/ui";
import { Mail, Phone, User, Calendar } from "lucide-react";

interface LeadCardProps {
    lead: {
        id: string;
        name: string | null;
        email: string;
        phone: string | null;
        created_at: string;
    };
}

export default function LeadCard({ lead }: LeadCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="space-y-3">
                    {lead.name && (
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{lead.name}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{lead.email}</span>
                    </div>
                    {lead.phone && (
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{lead.phone}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">{formatDate(lead.created_at)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

