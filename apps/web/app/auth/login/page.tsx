import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
    return (
        <div className="space-y-4">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-sm text-gray-500">
                    Enter your email to sign in to your account
                </p>
            </div>
            <LoginForm />
        </div>
    );
}
