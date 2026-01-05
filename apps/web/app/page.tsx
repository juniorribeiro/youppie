"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Home/Hero";
import Features from "@/components/Home/Features";
import Advantages from "@/components/Home/Advantages";
import HowItWorks from "@/components/Home/HowItWorks";
import CTASection from "@/components/Home/CTASection";
import Footer from "@/components/Home/Footer";
import LoginModal from "@/components/LoginModal";

export default function Home() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const handleLoginClick = () => setIsLoginModalOpen(true);

    return (
        <div className="min-h-screen">
            <Header onLoginClick={handleLoginClick} />
            <main>
                <Hero onLoginClick={handleLoginClick} />
                <Features />
                <Advantages />
                <HowItWorks />
                <CTASection onLoginClick={handleLoginClick} />
            </main>
            <Footer />
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </div>
    );
}
