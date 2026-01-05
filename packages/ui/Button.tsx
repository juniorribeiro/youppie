"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "outline" | "danger" | "success";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", loading = false, children, disabled, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

        const variants = {
            primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md active:scale-95",
            secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 active:scale-95",
            ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
            outline: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
            danger: "bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500 shadow-sm hover:shadow-md active:scale-95",
            success: "bg-success-500 text-white hover:bg-success-600 focus:ring-success-500 shadow-sm hover:shadow-md active:scale-95",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-4 py-2 text-base",
            lg: "px-6 py-3 text-lg",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    loading && "cursor-wait",
                    className
                )}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <>
                        <svg
                            className="mr-2 h-4 w-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Carregando...
                    </>
                ) : (
                    children
                )}
            </button>
        );
    }
);

Button.displayName = "Button";
