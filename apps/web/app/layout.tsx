import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Youppie',
    description: 'Sistema de criação e execução de quizzes interativos',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
