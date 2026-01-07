import Image from "next/image";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
    return (
        <div className="space-y-4">
            <div className="flex justify-center mb-4">
                <Image
                    src="/logo.png"
                    alt="Youppie"
                    width={200}
                    height={67}
                    className="h-16 w-auto"
                    priority
                />
            </div>
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Bem-vindo de volta</h1>
                <p className="text-sm text-gray-500">
                    Digite seu email para entrar na sua conta
                </p>
            </div>
            <LoginForm />
        </div>
    );
}
