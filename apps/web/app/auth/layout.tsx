import Image from "next/image";
import { Card, CardContent, CardHeader } from "@repo/ui";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/logo.png"
                            alt="Youppie"
                            width={270}
                            height={90}
                            className="h-16 w-auto"
                            priority
                        />
                    </div>
                </CardHeader>
                <CardContent>{children}</CardContent>
            </Card>
        </div>
    );
}
