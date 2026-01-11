import type { Metadata } from 'next'
import './globals.css'
import ProgressBar from '@/components/Loading/ProgressBar'
import ToastContainer from '@/components/Toast/ToastContainer'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://youppie.com.br'

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
        default: 'Youppie - Criador de Quizzes Interativos | Plataforma Brasileira',
        template: '%s | Youppie'
    },
    description: 'Plataforma brasileira completa para criar quizzes interativos. Capture leads, engaje sua audiência e transforme interações em resultados. Crie quizzes personalizados sem código.',
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
        'plataforma brasileira quiz'
    ],
    authors: [{ name: 'Youppie' }],
    creator: 'Youppie',
    publisher: 'Youppie',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: 'website',
        locale: 'pt_BR',
        url: baseUrl,
        siteName: 'Youppie',
        title: 'Youppie - Criador de Quizzes Interativos | Plataforma Brasileira',
        description: 'Plataforma brasileira completa para criar quizzes interativos. Capture leads, engaje sua audiência e transforme interações em resultados.',
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
        creator: '@youppie',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/favicon.ico',
        apple: '/favicon.ico',
    },
    alternates: {
        canonical: baseUrl,
    },
    verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR">
            <body>
                <ProgressBar />
                {children}
                <ToastContainer />
            </body>
        </html>
    )
}
