"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configurar NProgress
NProgress.configure({
    showSpinner: false,
    trickleSpeed: 200,
    minimum: 0.08,
});

export default function ProgressBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        let completionTimer: NodeJS.Timeout;
        
        // Iniciar progresso imediatamente
        NProgress.start();

        // Detectar quando a navegação completar usando eventos do Next.js
        // O Next.js App Router dispara eventos quando a navegação completa
        const handleRouteChangeComplete = () => {
            clearTimeout(completionTimer);
            NProgress.done();
        };

        // Usar um delay maior para garantir que a página realmente carregou
        // Aumentado de 100ms para 300ms para dar tempo suficiente
        completionTimer = setTimeout(handleRouteChangeComplete, 300);

        // Também tentar detectar quando o DOM está pronto
        if (typeof window !== 'undefined') {
            if (document.readyState === 'complete') {
                handleRouteChangeComplete();
            } else {
                window.addEventListener('load', handleRouteChangeComplete, { once: true });
            }
        }

        return () => {
            clearTimeout(completionTimer);
            if (typeof window !== 'undefined') {
                window.removeEventListener('load', handleRouteChangeComplete);
            }
            NProgress.done();
        };
    }, [pathname, searchParams]);

    return null;
}

