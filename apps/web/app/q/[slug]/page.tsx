import QuizRunner from "@/components/Runner/QuizRunner";

// Server Component to fetch initial data for SEO (optional, but good practice)
// For now we'll do client side to reuse existing api hooks logic, or fetch here using node-fetch if needed.
// To keep it simple and consistent with auth, we will client fetch in QuizRunner, 
// or I can fetch here if I want to pass initial props.
// Given strict separation, let's keep it client for now unless we set up server-side api client.

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function PublicQuizPage({ params }: PageProps) {
    const { slug } = await params;
    return <QuizRunner slug={slug} />;
}
