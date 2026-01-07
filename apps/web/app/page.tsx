import { Metadata } from 'next'
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
            <StructuredData />
            <HomeClient />
        </>
    )
}
