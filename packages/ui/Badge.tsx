"use client";

import React from "react";
import { cn } from "./utils";

interface BadgeProps {
    variant?: "success" | "warning" | "danger" | "info" | "default";
    children: React.ReactNode;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = "default", children, className }) => {
    const variants = {
        success: "bg-success-50 text-success-600 border-success-200",
        warning: "bg-warning-50 text-warning-600 border-warning-200",
        danger: "bg-danger-50 text-danger-600 border-danger-200",
        info: "bg-primary-50 text-primary-600 border-primary-200",
        default: "bg-gray-100 text-gray-700 border-gray-200",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
};
