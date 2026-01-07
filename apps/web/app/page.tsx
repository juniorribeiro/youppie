"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Hero from "@/components/Home/Hero";
import Features from "@/components/Home/Features";
import Advantages from "@/components/Home/Advantages";
import HowItWorks from "@/components/Home/HowItWorks";
import CTASection from "@/components/Home/CTASection";
import Footer from "@/components/Home/Footer";
import PricingSection from "@/components/Home/PricingSection";
import PricingComparison from "@/components/Home/PricingComparison";
import LoginModal from "@/components/LoginModal";
import PlansModal from "@/components/Subscription/PlansModal";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { useAuthStore } from "@/store/auth";

export default function Home() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>();
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        // Verificar se há plano selecionado no sessionStorage após login
        const checkSelectedPlan = () => {
            const planId = sessionStorage.getItem("selectedPlanId");
            if (planId && isAuthenticated) {
                setSelectedPlanId(planId);
                setIsPlansModalOpen(true);
                sessionStorage.removeItem("selectedPlanId");
            }
        };

        if (isAuthenticated) {
            checkSelectedPlan();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        // Listener para eventos customizados
        const handleOpenLoginModal = () => {
            setIsLoginModalOpen(true);
        };

        const handleOpenPlansModal = (event: CustomEvent) => {
            if (isAuthenticated) {
                setSelectedPlanId(event.detail?.planId);
                setIsPlansModalOpen(true);
            } else {
                setIsLoginModalOpen(true);
            }
        };

        window.addEventListener("openLoginModal", handleOpenLoginModal as EventListener);
        window.addEventListener("openPlansModal", handleOpenPlansModal as EventListener);

        return () => {
            window.removeEventListener("openLoginModal", handleOpenLoginModal as EventListener);
            window.removeEventListener("openPlansModal", handleOpenPlansModal as EventListener);
        };
    }, [isAuthenticated]);

    const handleLoginClick = () => setIsLoginModalOpen(true);

    const handleLoginSuccess = () => {
        setIsLoginModalOpen(false);
        // Verificar se há plano selecionado
        const planId = sessionStorage.getItem("selectedPlanId");
        if (planId) {
            setSelectedPlanId(planId);
            setIsPlansModalOpen(true);
            sessionStorage.removeItem("selectedPlanId");
        } else {
            router.push("/dashboard");
        }
    };

    const handlePlansModalSuccess = () => {
        setIsPlansModalOpen(false);
        setSelectedPlanId(undefined);
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen">
            <GoogleAnalytics />
            <Header onLoginClick={handleLoginClick} />
            <main>
                <Hero onLoginClick={handleLoginClick} />
                <Features />
                <Advantages />
                <HowItWorks />
                <PricingSection />
                <PricingComparison />
                <CTASection onLoginClick={handleLoginClick} />
            </main>
            <Footer />
            <LoginModal 
                isOpen={isLoginModalOpen} 
                onClose={() => setIsLoginModalOpen(false)}
                selectedPlanId={selectedPlanId}
            />
            {isAuthenticated && (
                <PlansModal
                    isOpen={isPlansModalOpen}
                    onClose={() => {
                        setIsPlansModalOpen(false);
                        setSelectedPlanId(undefined);
                    }}
                    onSuccess={handlePlansModalSuccess}
                    selectedPlanId={selectedPlanId}
                />
            )}
        </div>
    );
}
