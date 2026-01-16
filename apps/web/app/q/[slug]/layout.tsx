import { Metadata } from "next";
import TrackingScripts, { TrackingBodyScripts, TrackingFooterScripts } from "@/components/Tracking/TrackingScripts";

interface LayoutProps {
    params: Promise<{ slug: string }>;
    children: React.ReactNode;
}

async function fetchQuizData(slug: string) {
    // Em server components, usar a URL interna do Docker se disponível, senão a pública
    // API_URL_INTERNAL é usado dentro do Docker para comunicação entre containers
    const apiUrl = process.env.API_URL_INTERNAL || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
    
    try {
        const response = await fetch(`${apiUrl}/quizzes/public/${slug}`, {
            cache: "no-store",
        });
        
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar dados do quiz:", error);
        return null;
    }
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
    const { slug } = await params;
    const quiz = await fetchQuizData(slug);
    if (quiz) {
        return {
            title: quiz.title || "Quiz",
            description: quiz.description || undefined,
        };
    }
    return {
        title: "Quiz",
    };
}

export default async function QuizLayout({ params, children }: LayoutProps) {
    const { slug } = await params;
    
    // Buscar dados do quiz incluindo tracking do quiz
    const quiz = await fetchQuizData(slug);
    let trackingData = null;
    
    if (quiz) {
        trackingData = {
            google_analytics_id: quiz.google_analytics_id,
            google_tag_manager_id: quiz.google_tag_manager_id,
            facebook_pixel_id: quiz.facebook_pixel_id,
            tracking_head: quiz.tracking_head,
            tracking_body: quiz.tracking_body,
            tracking_footer: quiz.tracking_footer,
        };
    }

    return (
        <>
            {trackingData && (
                <>
                    <TrackingScripts tracking={trackingData} />
                    <TrackingBodyScripts tracking={trackingData} />
                    <TrackingFooterScripts tracking={trackingData} />
                </>
            )}
            {children}
        </>
    );
}

