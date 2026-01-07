const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://youppie.com.br'

export default function StructuredData() {
    const softwareApplicationSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Youppie',
        applicationCategory: 'WebApplication',
        operatingSystem: 'Web',
        offers: {
            '@type': 'AggregateOffer',
            offerCount: 4,
            lowPrice: '0',
            highPrice: '199',
            priceCurrency: 'BRL',
        },
        description: 'Plataforma brasileira completa para criar quizzes interativos. Capture leads, engaje sua audiência e transforme interações em resultados.',
        url: baseUrl,
        author: {
            '@type': 'Organization',
            name: 'Youppie',
        },
        featureList: [
            'Editor de texto rico',
            'Biblioteca de imagens',
            'Múltiplos tipos de steps',
            'Drag & drop intuitivo',
            'URLs personalizadas',
            'Dashboard completo',
            'Captura de leads',
            'Analytics em tempo real',
        ],
        screenshot: `${baseUrl}/logo-grande.png`,
        softwareVersion: '1.0',
        releaseNotes: 'Plataforma completa de quizzes interativos',
    }

    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Youppie',
        url: baseUrl,
        logo: `${baseUrl}/logo-grande.png`,
        description: 'Plataforma brasileira de criação de quizzes interativos',
        sameAs: [
            // Adicione redes sociais aqui quando disponíveis
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Suporte',
            availableLanguage: 'Portuguese',
        },
    }

    const webApplicationSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Youppie',
        url: baseUrl,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: 'Crie quizzes interativos personalizados sem código. Capture leads e engaje sua audiência.',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        softwareVersion: '1.0',
        featureList: [
            'Criação de quizzes sem código',
            'Editor visual drag & drop',
            'Captura de leads',
            'Analytics e métricas',
            'Temas personalizáveis',
            'Integração com pixels',
        ],
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock',
        },
    }

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: baseUrl,
            },
        ],
    }

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'O que é o Youppie?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Youppie é uma plataforma brasileira completa para criar quizzes interativos sem código. Permite capturar leads, engajar audiências e transformar interações em resultados através de quizzes personalizados.',
                },
            },
            {
                '@type': 'Question',
                name: 'Como criar um quiz no Youppie?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Criar um quiz no Youppie é simples: faça seu cadastro, clique em "Novo Quiz", use o editor visual drag & drop para adicionar perguntas, imagens e personalizar o design, e publique com um clique.',
                },
            },
            {
                '@type': 'Question',
                name: 'O Youppie é gratuito?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Sim, o Youppie oferece um plano gratuito com recursos básicos. Também temos planos pagos com mais funcionalidades, quizzes ilimitados e recursos avançados de analytics.',
                },
            },
            {
                '@type': 'Question',
                name: 'Posso capturar leads com os quizzes?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Sim! O Youppie permite capturar leads através dos seus quizzes. Você pode configurar campos de captura (nome, email, telefone) e todos os dados são salvos no dashboard para download ou exportação.',
                },
            },
            {
                '@type': 'Question',
                name: 'O Youppie precisa de conhecimento técnico?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Não! O Youppie foi desenvolvido para ser 100% sem código. A interface é intuitiva e visual, permitindo criar quizzes profissionais sem qualquer conhecimento técnico.',
                },
            },
        ],
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
        </>
    )
}

