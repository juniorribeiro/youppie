import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-blue-600">
                        Youppie
                    </CardTitle>
                </CardHeader>
                <CardContent>{children}</CardContent>
            </Card>
        </div>
    );
}
