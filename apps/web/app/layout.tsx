import type { Metadata } from 'next'
import './globals.css'
import ProgressBar from '@/components/Loading/ProgressBar'

export const metadata: Metadata = {
    title: 'Youppie',
    description: 'Sistema de criação e execução de quizzes interativos',
    icons: {
        icon: '/favicon.ico',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <ProgressBar />
                {children}
            </body>
        </html>
    )
}
