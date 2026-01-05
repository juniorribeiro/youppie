import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // 1. Create Admin User
    const passwordHash = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password_hash: passwordHash,
        },
    })

    console.log(`Created user: ${admin.id} (${admin.email})`)

    // 2. Create Sales Quiz
    const quiz = await prisma.quiz.upsert({
        where: { slug: 'diagnostico-vendas-b2b' },
        update: {},
        create: {
            user_id: admin.id,
            title: 'Diagnostico de Vendas B2B',
            description: 'Descubra como otimizar seu processo comercial.',
            slug: 'diagnostico-vendas-b2b',
            is_published: true,
            capture_mode: 'AFTER',
        },
    })

    console.log(`Created quiz: ${quiz.title}`)

    // 3. Create Steps

    // Step 1: Intro Text
    await prisma.step.create({
        data: {
            quiz_id: quiz.id,
            order: 1,
            title: 'Bem-vindo ao Diagnóstico',
            description: 'Vamos analisar seu cenário atual para sugerir melhorias.',
            type: 'TEXT',
        }
    })

    // Step 2: Question 1
    await prisma.step.create({
        data: {
            quiz_id: quiz.id,
            order: 2,
            title: 'Qual o tamanho da sua equipe de vendas?',
            type: 'QUESTION',
            question: {
                create: {
                    text: 'Selecione a opção que melhor descreve sua estrutura atual.',
                    options: {
                        create: [
                            { text: 'Apenas eu (Eu-quipe)', value: 'solo' },
                            { text: '2 a 5 vendedores', value: 'small' },
                            { text: '6 a 20 vendedores', value: 'medium' },
                            { text: 'Mais de 20 vendedores', value: 'large' },
                        ]
                    }
                }
            }
        }
    })

    // Step 3: Question 2
    await prisma.step.create({
        data: {
            quiz_id: quiz.id,
            order: 3,
            title: 'Qual seu maior desafio hoje?',
            type: 'QUESTION',
            question: {
                create: {
                    text: 'Onde o sapato aperta mais?',
                    options: {
                        create: [
                            { text: 'Gerar Leads Qualificados', value: 'leads' },
                            { text: 'Fechar Contratos (Taxa de Conversão)', value: 'closing' },
                            { text: 'Contratar e Treinar', value: 'hiring' },
                            { text: 'Gestão e Processos', value: 'management' },
                        ]
                    }
                }
            }
        }
    })

    // Step 4: Capture
    await prisma.step.create({
        data: {
            quiz_id: quiz.id,
            order: 4,
            title: 'Quase lá!',
            description: 'Deixe seu melhor email para receber o diagnóstico completo.',
            type: 'CAPTURE',
        }
    })

    // Step 5: Result
    await prisma.step.create({
        data: {
            quiz_id: quiz.id,
            order: 5,
            title: 'Análise Concluída',
            description: 'Com base nas suas respostas, temos uma estratégia perfeita para você.',
            type: 'RESULT',
        }
    })

    // Create Result Page Config
    await prisma.resultPage.create({
        data: {
            quiz_id: quiz.id,
            headline_template: "Plano de Aceleração de Vendas",
            body_template: "Sua empresa tem grande potencial. Recomendamos focar em processos outbound.",
            cta_text: "Agendar Consultoria Gratuita",
            cta_url: "https://calendar.google.com/example"
        }
    })

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
