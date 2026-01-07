"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ExpandableMenuProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}

export default function ExpandableMenu({ title, icon, children, defaultExpanded = false }: ExpandableMenuProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all group"
            >
                {icon}
                <span className="font-medium flex-1 text-left">{title}</span>
                {isExpanded ? (
                    <ChevronDown className="h-4 w-4 transition-transform" />
                ) : (
                    <ChevronRight className="h-4 w-4 transition-transform" />
                )}
            </button>
            {isExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                    {children}
                </div>
            )}
        </div>
    );
}

