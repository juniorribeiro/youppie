"use client";

import { useEffect } from "react";
import Script from "next/script";

interface TrackingData {
    google_analytics_id?: string | null;
    google_tag_manager_id?: string | null;
    facebook_pixel_id?: string | null;
    tracking_head?: string | null;
    tracking_body?: string | null;
    tracking_footer?: string | null;
}

interface TrackingScriptsProps {
    tracking: TrackingData;
}

// Flag global para rastrear scripts já adicionados (não remover no cleanup)
const addedScriptsGlobal = new Set<string>();

// Componente para injetar scripts no <head>
export default function TrackingScripts({ tracking }: TrackingScriptsProps) {
    useEffect(() => {
        if (typeof document === "undefined") return;

        // Injetar scripts no head
        const headScripts: Array<{ id: string; content: string }> = [];

        if (tracking.google_analytics_id) {
            headScripts.push({ id: "ga-script", content: tracking.google_analytics_id });
        }

        if (tracking.google_tag_manager_id) {
            headScripts.push({ id: "gtm-script", content: tracking.google_tag_manager_id });
        }

        if (tracking.facebook_pixel_id) {
            headScripts.push({ id: "fb-pixel-script", content: tracking.facebook_pixel_id });
        }

        if (tracking.tracking_head) {
            headScripts.push({ id: "custom-head-script", content: tracking.tracking_head });
        }

        // Criar elementos e injetar no head
        headScripts.forEach(({ id, content }) => {
            // Verificar se já foi adicionado globalmente (não remover no cleanup)
            if (addedScriptsGlobal.has(id)) {
                return;
            }

            // Verificar se já existe um script com este ID de tracking no DOM
            const existingScript = document.querySelector(`script[data-tracking-id="${id}"]`);
            if (existingScript) {
                // Se já existe no DOM, marcar como adicionado globalmente
                addedScriptsGlobal.add(id);
                return;
            }

            // Criar container para o script
            const container = document.createElement("div");
            container.id = id;
            container.innerHTML = content;
            
            // Mover todos os scripts do container para o head
            const scripts = container.querySelectorAll("script");
            scripts.forEach((script) => {
                // Criar um novo elemento script
                const newScript = document.createElement("script");
                
                // Adicionar identificador único para poder verificar e remover depois
                newScript.setAttribute("data-tracking-id", id);
                
                // Copiar todos os atributos do script original
                Array.from(script.attributes).forEach((attr) => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                
                // IMPORTANTE: Usar textContent em vez de innerHTML para que o script seja executado
                // Scripts criados dinamicamente com innerHTML não são executados automaticamente
                if (script.innerHTML || script.textContent) {
                    newScript.textContent = script.innerHTML || script.textContent || '';
                    document.head.appendChild(newScript);
                    // Marcar como adicionado globalmente (não remover no cleanup)
                    addedScriptsGlobal.add(id);
                } else if (script.src) {
                    // Para scripts externos, apenas adicionar o src
                    newScript.src = script.src;
                    document.head.appendChild(newScript);
                    // Marcar como adicionado globalmente (não remover no cleanup)
                    addedScriptsGlobal.add(id);
                }
            });

            // Se houver outros elementos (noscript, etc), adicionar também
            const otherElements = container.querySelectorAll(":not(script)");
            otherElements.forEach((el) => {
                document.head.appendChild(el.cloneNode(true));
            });
        });

        // NÃO fazer cleanup - scripts de tracking não devem ser removidos
        // pois já foram executados e podem causar problemas se removidos
        return () => {
            // Não remover scripts - eles já foram executados e devem persistir
        };
    }, [tracking]);

    return null;
}

// Componente para injetar scripts antes de </body>
export function TrackingBodyScripts({ tracking }: TrackingScriptsProps) {
    useEffect(() => {
        if (typeof document === "undefined" || !tracking.tracking_body) return;

        const id = "custom-body-script";
        
        // Verificar se já existe um script com este ID de tracking
        const existingScript = document.querySelector(`script[data-tracking-id="${id}"]`);
        if (existingScript) {
            return;
        }

        // Criar container
        const container = document.createElement("div");
        container.id = id;
        container.innerHTML = tracking.tracking_body;

        const addedScripts: HTMLScriptElement[] = [];

        // Injetar scripts antes do fechamento do body
        const scripts = container.querySelectorAll("script");
        scripts.forEach((script) => {
            const newScript = document.createElement("script");
            newScript.setAttribute("data-tracking-id", id);
            Array.from(script.attributes).forEach((attr) => {
                newScript.setAttribute(attr.name, attr.value);
            });
            // Usar textContent em vez de innerHTML para que o script seja executado
            if (script.innerHTML || script.textContent) {
                newScript.textContent = script.innerHTML || script.textContent || '';
            }
            if (script.src) {
                newScript.src = script.src;
            }
            document.body.appendChild(newScript);
            addedScripts.push(newScript);
        });

        // Outros elementos
        const otherElements = container.querySelectorAll(":not(script)");
        otherElements.forEach((el) => {
            document.body.appendChild(el.cloneNode(true));
        });

        // Cleanup - remover scripts adicionados
        return () => {
            addedScripts.forEach((script) => {
                if (script.parentNode) {
                    script.remove();
                }
            });
        };
    }, [tracking.tracking_body]);

    return null;
}

// Componente para injetar scripts no final do <body>
export function TrackingFooterScripts({ tracking }: TrackingScriptsProps) {
    useEffect(() => {
        if (typeof document === "undefined" || !tracking.tracking_footer) return;

        const id = "custom-footer-script";
        
        // Verificar se já existe um script com este ID de tracking
        const existingScript = document.querySelector(`script[data-tracking-id="${id}"]`);
        if (existingScript) {
            return;
        }

        // Criar container
        const container = document.createElement("div");
        container.id = id;
        container.innerHTML = tracking.tracking_footer;

        const addedScripts: HTMLScriptElement[] = [];

        // Injetar scripts no final do body
        const scripts = container.querySelectorAll("script");
        scripts.forEach((script) => {
            const newScript = document.createElement("script");
            newScript.setAttribute("data-tracking-id", id);
            Array.from(script.attributes).forEach((attr) => {
                newScript.setAttribute(attr.name, attr.value);
            });
            // Usar textContent em vez de innerHTML para que o script seja executado
            if (script.innerHTML || script.textContent) {
                newScript.textContent = script.innerHTML || script.textContent || '';
            }
            if (script.src) {
                newScript.src = script.src;
            }
            document.body.appendChild(newScript);
            addedScripts.push(newScript);
        });

        // Outros elementos
        const otherElements = container.querySelectorAll(":not(script)");
        otherElements.forEach((el) => {
            document.body.appendChild(el.cloneNode(true));
        });

        // Cleanup - remover scripts adicionados
        return () => {
            addedScripts.forEach((script) => {
                if (script.parentNode) {
                    script.remove();
                }
            });
        };
    }, [tracking.tracking_footer]);

    return null;
}

