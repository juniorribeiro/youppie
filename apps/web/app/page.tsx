import { Metadata } from 'next'
import Script from 'next/script'
import HomeClient from '@/components/Home/HomeClient'
import StructuredData from '@/components/SEO/StructuredData'

export const metadata: Metadata = {
    title: 'Youppie - Criador de Quizzes Interativos | Plataforma Brasileira',
    description: 'Plataforma brasileira completa para criar quizzes interativos. Capture leads, engaje sua audiência e transforme interações em resultados. Crie quizzes personalizados sem código com editor visual drag & drop.',
    keywords: [
        'quiz brasileiro',
        'criar quiz online',
        'plataforma de quiz',
        'quiz interativo',
        'criar questionário online',
        'ferramenta de quiz',
        'quiz para captura de leads',
        'quiz personalizado',
        'sistema de quiz',
        'quiz sem código',
        'criar quiz grátis',
        'plataforma brasileira quiz',
        'quiz para marketing',
        'quiz viral',
        'quiz interativo brasileiro'
    ],
    openGraph: {
        title: 'Youppie - Criador de Quizzes Interativos | Plataforma Brasileira',
        description: 'Plataforma brasileira completa para criar quizzes interativos. Capture leads, engaje sua audiência e transforme interações em resultados.',
        type: 'website',
        images: [
            {
                url: '/logo-grande.png',
                width: 1200,
                height: 630,
                alt: 'Youppie - Plataforma de Quizzes Interativos',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Youppie - Criador de Quizzes Interativos',
        description: 'Plataforma brasileira completa para criar quizzes interativos. Capture leads e engaje sua audiência.',
        images: ['/logo-grande.png'],
    },
    alternates: {
        canonical: '/',
    },
}

export default function Home() {
    return (
        <>
            {/* Google tag (gtag.js) */}
            <Script
                src="https://www.googletagmanager.com/gtag/js?id=G-43MS48GEXK"
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-43MS48GEXK');
                `}
            </Script>
            {/* Meta Pixel Code */}
            <Script id="meta-pixel" strategy="afterInteractive">
                {`
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '1955804942029137');
                    fbq('track', 'PageView');
                `}
            </Script>
            <noscript>
                <img 
                    height="1" 
                    width="1" 
                    style={{ display: 'none' }}
                    src="https://www.facebook.com/tr?id=1955804942029137&ev=PageView&noscript=1"
                    alt=""
                />
            </noscript>
            <StructuredData />
            <HomeClient />
        </>
    )
}
