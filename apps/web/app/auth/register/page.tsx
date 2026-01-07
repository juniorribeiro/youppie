import Image from "next/image";
import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
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
                <h1 className="text-2xl font-bold tracking-tight">Criar uma conta</h1>
                <p className="text-sm text-gray-500">
                    Digite seus dados abaixo para criar sua conta
                </p>
            </div>
            <RegisterForm />
        </div>
    );
}
