"use client";

import { useEffect } from "react";

export default function GoogleAnalytics() {
    useEffect(() => {
        // Verificar se está em produção e se a variável de ambiente está definida
        const isProduction = process.env.NODE_ENV === "production";
        const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

        if (!isProduction || !gaId) {
            return;
        }

        // Injetar o primeiro script (gtag.js)
        const script1 = document.createElement("script");
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script1);

        // Injetar o segundo script (configuração)
        const script2 = document.createElement("script");
        script2.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
        `;
        document.head.appendChild(script2);

        // Cleanup: remover scripts quando o componente for desmontado
        return () => {
            if (document.head.contains(script1)) {
                document.head.removeChild(script1);
            }
            if (document.head.contains(script2)) {
                document.head.removeChild(script2);
            }
        };
    }, []);

    // Componente não renderiza nada visualmente
    return null;
}

