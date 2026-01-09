/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/ui"],
    // Only use standalone output in production
    ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3003',
                pathname: '/uploads/**',
            },
        ],
        unoptimized: process.env.NODE_ENV === 'production',
    },
    async rewrites() {
        // Use localhost in development, Docker hostname in production
        const apiUrl = process.env.API_URL_INTERNAL || (process.env.NODE_ENV === 'production' ? 'http://api:3003' : 'http://localhost:3003');
        return [
            {
                source: '/uploads/:path*',
                destination: `${apiUrl}/uploads/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
