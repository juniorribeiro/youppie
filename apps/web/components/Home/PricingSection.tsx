"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function PricingSection() {
    useEffect(() => {
        // Função recursiva para aplicar estilos em todos os elementos
        const applyStylesRecursively = (element: HTMLElement, depth: number = 0): void => {
            if (depth > 10) return; // Limitar profundidade para evitar loops infinitos
            
            const children = Array.from(element.children) as HTMLElement[];
            
            // Se tem múltiplos filhos, provavelmente é um container de planos
            if (children.length >= 2) {
                const computedStyle = window.getComputedStyle(element);
                
                // Forçar flex row se ainda não estiver
                if (computedStyle.display !== 'flex' || computedStyle.flexDirection !== 'row') {
                    element.style.setProperty('display', 'flex', 'important');
                    element.style.setProperty('flex-direction', 'row', 'important');
                    element.style.setProperty('gap', '1rem', 'important');
                    element.style.setProperty('justify-content', 'center', 'important');
                    element.style.setProperty('flex-wrap', 'nowrap', 'important');
                    element.style.setProperty('align-items', 'stretch', 'important');
                    element.style.setProperty('width', '100%', 'important');
                }
                
                // Aplicar flex nos filhos
                children.forEach((child) => {
                    child.style.setProperty('flex', '1 1 0', 'important');
                    child.style.setProperty('min-width', '0', 'important');
                    child.style.setProperty('max-width', '100%', 'important');
                    child.style.setProperty('width', 'auto', 'important');
                });
            }
            
            // Continuar recursivamente
            children.forEach((child) => {
                applyStylesRecursively(child, depth + 1);
            });
        };

        // Função principal para aplicar layout horizontal
        const applyHorizontalLayout = () => {
            const pricingTable = document.querySelector('stripe-pricing-table');
            if (pricingTable) {
                const shadowRoot = pricingTable.shadowRoot;
                if (shadowRoot) {
                    // Encontrar o elemento raiz do Shadow DOM
                    const rootElement = shadowRoot.firstElementChild as HTMLElement;
                    if (rootElement) {
                        applyStylesRecursively(rootElement);
                    }
                    
                    // Também aplicar em todos os elementos diretamente
                    const allElements = shadowRoot.querySelectorAll('*') as NodeListOf<HTMLElement>;
                    allElements.forEach((el) => {
                        if (el.children && el.children.length >= 2) {
                            el.style.setProperty('display', 'flex', 'important');
                            el.style.setProperty('flex-direction', 'row', 'important');
                            el.style.setProperty('gap', '1rem', 'important');
                            el.style.setProperty('justify-content', 'center', 'important');
                            el.style.setProperty('flex-wrap', 'nowrap', 'important');
                            el.style.setProperty('align-items', 'stretch', 'important');
                            el.style.setProperty('width', '100%', 'important');
                            
                            // Aplicar nos filhos
                            Array.from(el.children).forEach((child) => {
                                const childEl = child as HTMLElement;
                                childEl.style.setProperty('flex', '1 1 0', 'important');
                                childEl.style.setProperty('min-width', '0', 'important');
                                childEl.style.setProperty('max-width', '100%', 'important');
                            });
                        }
                    });
                }
            }
        };

        // Usar requestAnimationFrame para garantir timing correto
        const applyWithRAF = () => {
            requestAnimationFrame(() => {
                applyHorizontalLayout();
            });
        };

        // Usar MutationObserver com configuração mais específica
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    applyWithRAF();
                }
            });
        });

        // Observar mudanças no documento e no componente Stripe
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
        });

        // Observar especificamente o componente Stripe
        const stripeObserver = new MutationObserver(() => {
            applyWithRAF();
        });

        // Aguardar o componente ser adicionado ao DOM
        const checkStripeElement = setInterval(() => {
            const pricingTable = document.querySelector('stripe-pricing-table');
            if (pricingTable) {
                stripeObserver.observe(pricingTable, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                });
                clearInterval(checkStripeElement);
            }
        }, 100);

        // Aplicar imediatamente e depois em intervalos
        applyWithRAF();
        const interval = setInterval(() => {
            applyWithRAF();
        }, 200);

        // Limpar após 20 segundos
        setTimeout(() => {
            clearInterval(interval);
            clearInterval(checkStripeElement);
            observer.disconnect();
            stripeObserver.disconnect();
        }, 20000);

        return () => {
            clearInterval(interval);
            clearInterval(checkStripeElement);
            observer.disconnect();
            stripeObserver.disconnect();
        };
    }, []);

    return (
        <>
            <Script
                src="https://js.stripe.com/v3/pricing-table.js"
                strategy="lazyOnload"
            />
            <style jsx global>{`
                stripe-pricing-table {
                    display: block !important;
                    width: 100% !important;
                    max-width: 100% !important;
                }
                
                /* Forçar layout horizontal nos planos do Stripe - tentar múltiplos seletores */
                stripe-pricing-table::part(pricing-table-container),
                stripe-pricing-table::part(pricing-table),
                stripe-pricing-table [class*="pricing-table"],
                stripe-pricing-table [class*="PricingTable"],
                stripe-pricing-table [class*="container"],
                stripe-pricing-table [class*="Container"],
                stripe-pricing-table > div,
                stripe-pricing-table > *,
                stripe-pricing-table > * > *,
                stripe-pricing-table > * > * > * {
                    display: flex !important;
                    flex-direction: row !important;
                    gap: 1rem !important;
                    justify-content: center !important;
                    flex-wrap: nowrap !important;
                    align-items: stretch !important;
                    width: 100% !important;
                    max-width: 100% !important;
                }
                
                /* Garantir que os cards dos planos fiquem lado a lado */
                stripe-pricing-table [class*="pricing-table"] > *,
                stripe-pricing-table [class*="PricingTable"] > *,
                stripe-pricing-table [class*="container"] > *,
                stripe-pricing-table [class*="Container"] > *,
                stripe-pricing-table > div > *,
                stripe-pricing-table > * > *,
                stripe-pricing-table > * > * > *,
                stripe-pricing-table > * > * > * > * {
                    flex: 1 1 0 !important;
                    min-width: 0 !important;
                    max-width: 100% !important;
                    width: auto !important;
                }
                
                /* Forçar que elementos com múltiplos filhos sejam flex row */
                stripe-pricing-table * {
                    box-sizing: border-box !important;
                }
            `}</style>
            <section id="precos" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Planos que se adaptam ao seu negócio
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Escolha o plano ideal para suas necessidades. Todos os planos incluem suporte completo.
                        </p>
                    </div>

                    <div className="w-full" style={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
                        <div style={{ width: '100%', maxWidth: '100%' }}>
                            <stripe-pricing-table
                                pricing-table-id="prctbl_1Sp9Nl9SxJsgAivqGoUhxMEF"
                                publishable-key="pk_live_51Sp8Em9SxJsgAivqu1CoSZToDwRIw0W50OOjlNCpi8C6EyGG0TozsmtK2K8iSLPJSPhhS3iV8KL7QDMCHj9LBk9q00zw90xcLs"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

