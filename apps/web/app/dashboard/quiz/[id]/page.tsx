"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import QuizEditor from "@/components/Editor/QuizEditor";

export default function QuizEditorPage() {
    const params = useParams();
    const id = params.id as string;
    const token = useAuthStore((state) => state.token);
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token && id) {
            apiFetch(`/quizzes/${id}`, { token })
                .then(setQuiz)
                .catch((err) => {
                    console.error(err);
                    // handle 404 or auth error
                })
                .finally(() => setLoading(false));
        }
    }, [token, id]);

    if (loading) return <div>Loading editor...</div>;
    if (!quiz) return <div>Quiz not found</div>;

    return <QuizEditor initialQuiz={quiz} />;
}
