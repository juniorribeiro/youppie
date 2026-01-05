import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
    return (
        <div className="space-y-4">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
                <p className="text-sm text-gray-500">
                    Enter your details below to create your account
                </p>
            </div>
            <RegisterForm />
        </div>
    );
}
