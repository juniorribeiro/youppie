/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/ui"],
    output: 'standalone',
    async rewrites() {
        const apiUrl = process.env.API_URL_INTERNAL || 'http://api:3003';
        return [
            {
                source: '/uploads/:path*',
                destination: `${apiUrl}/uploads/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
